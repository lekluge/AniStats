import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";

const baseUrl = (
  process.env.SCREENSHOT_BASE_URL ??
  process.env.NUXT_PUBLIC_SITE_URL ??
  "http://localhost:3000"
).replace(/\/$/, "");
const outputDir = process.env.SCREENSHOT_OUTPUT_DIR ?? "screenshots";
const locales = splitCsv(process.env.SCREENSHOT_LOCALES ?? "de,en");
const routes = splitCsv(
  process.env.SCREENSHOT_ROUTES ??
    "/dashboard,/calendar,/genres,/tags,/relations,/combine,/compare,/recommendation,/history",
);
const themes = normalizeThemes(
  process.env.SCREENSHOT_THEMES ??
    process.env.SCREENSHOT_THEME ??
    "light,dark",
);
const fullPage = (process.env.SCREENSHOT_FULL_PAGE ?? "true").toLowerCase() !== "false";
const waitMs = Number(process.env.SCREENSHOT_WAIT_MS ?? "2500");
const navTimeoutMs = Number(process.env.SCREENSHOT_NAV_TIMEOUT_MS ?? "90000");
const readyTimeoutMs = Number(process.env.SCREENSHOT_READY_TIMEOUT_MS ?? "120000");
const postReadyWaitMs = Number(process.env.SCREENSHOT_POST_READY_WAIT_MS ?? "800");

const rawViewports = splitCsv(
  process.env.SCREENSHOT_VIEWPORTS ?? "desktop:1440x900,mobile:390x844",
);
const viewports = rawViewports.map(parseViewport).filter(Boolean);

if (viewports.length === 0) {
  throw new Error("No valid viewports found. Use SCREENSHOT_VIEWPORTS like desktop:1440x900,mobile:390x844");
}

const token = (
  process.env.SCREENSHOT_ANILIST_TOKEN ??
  process.env.ANILIST_TOKEN ??
  ""
).trim();
const userName = (process.env.SCREENSHOT_ANILIST_USER ?? "").trim();

const { hostname, protocol } = new URL(baseUrl);
const secure = protocol === "https:";
const authCookies = [];
if (token) {
  authCookies.push({
    name: "anilist_token",
    value: token,
    domain: hostname,
    path: "/",
    httpOnly: true,
    secure,
    sameSite: "Lax",
  });
}
if (userName) {
  authCookies.push({
    name: "anilist-user",
    value: userName,
    domain: hostname,
    path: "/",
    httpOnly: false,
    secure,
    sameSite: "Lax",
  });
}

await fs.mkdir(outputDir, { recursive: true });

console.log(`[screenshots] baseUrl=${baseUrl}`);
console.log(`[screenshots] outputDir=${path.resolve(outputDir)}`);
console.log(`[screenshots] locales=${locales.join(",")}`);
console.log(`[screenshots] routes=${routes.join(",")}`);
console.log(`[screenshots] viewports=${viewports.map((v) => `${v.name}:${v.width}x${v.height}`).join(",")}`);
console.log(`[screenshots] themes=${themes.join(",")}`);
if (!token) {
  console.warn("[screenshots] SCREENSHOT_ANILIST_TOKEN not set. Protected routes may redirect to '/'.");
}

const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });

    if (authCookies.length > 0) {
      await context.addCookies(authCookies);
    }

    for (const locale of locales) {
      if (!["de", "en"].includes(locale)) {
        console.warn(`[screenshots] Skip unsupported locale '${locale}'`);
        continue;
      }

      await context.addCookies([
        {
          name: "anistats-locale",
          value: locale,
          domain: hostname,
          path: "/",
          httpOnly: false,
          secure,
          sameSite: "Lax",
        },
      ]);

      for (const theme of themes) {
        for (const route of routes) {
          const page = await context.newPage();
          page.setDefaultNavigationTimeout(navTimeoutMs);
          page.setDefaultTimeout(navTimeoutMs);

          try {
            await page.goto(`${baseUrl}${route}`, {
              waitUntil: "domcontentloaded",
              timeout: navTimeoutMs,
            });
            await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});

            await page.evaluate((nextTheme) => {
              localStorage.setItem("anistats-theme", nextTheme);
              document.documentElement.setAttribute("data-theme", nextTheme);
            }, theme);

            await waitForPageReady(page, route, readyTimeoutMs);
            await page.waitForTimeout(waitMs);
            await page.waitForTimeout(postReadyWaitMs);

            const currentUrl = new URL(page.url());
            if (route !== "/" && currentUrl.pathname === "/" && !token) {
              console.warn(`[screenshots] ${route} redirected to '/'. Add SCREENSHOT_ANILIST_TOKEN for private pages.`);
            }

            const safeRoute = route.replace(/^\//, "").replaceAll("/", "-") || "home";
            const localeFolder = locale.toUpperCase();
            const themeFolder = theme === "light" ? "white" : theme;
            const fileDir = path.join(outputDir, viewport.name, localeFolder, themeFolder);
            const filePath = path.join(fileDir, `${safeRoute}.png`);

            await fs.mkdir(fileDir, { recursive: true });
            await page.screenshot({ path: filePath, fullPage });
            console.log(`[screenshots] wrote ${filePath}`);
          } catch (err) {
            console.error(
              `[screenshots] failed route '${route}' (${locale}/${theme}/${viewport.name}):`,
              err?.message ?? err,
            );
          } finally {
            await page.close();
          }
        }
      }
    }

    await context.close();
  }
} finally {
  await browser.close();
}

function splitCsv(value) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseViewport(input) {
  const [namePart, sizePart] = input.split(":");
  const name = (namePart ?? "").trim();
  const size = (sizePart ?? "").trim();
  const [w, h] = size.split("x").map((n) => Number(n));

  if (!name || !Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
    return null;
  }

  return { name, width: Math.round(w), height: Math.round(h) };
}

function normalizeThemes(input) {
  const values = splitCsv(input)
    .map((value) => value.toLowerCase())
    .map((value) => (value === "white" ? "light" : value))
    .filter((value) => value === "light" || value === "dark");

  return values.length ? [...new Set(values)] : ["light", "dark"];
}

async function waitForPageReady(page, route, timeoutMs) {
  await page.locator("main").first().waitFor({ state: "visible", timeout: timeoutMs });
  await page.locator(".page-shell").first().waitFor({ state: "visible", timeout: timeoutMs }).catch(() => {});

  const routeReadySelector = getRouteReadySelector(route);
  const spinnerGone = page.waitForFunction(
    () => {
      const main = document.querySelector("main");
      if (!main) return false;
      const spinner = main.querySelector(".animate-spin");
      const busy = main.querySelector('[aria-busy="true"]');
      return !spinner && !busy;
    },
    { timeout: timeoutMs },
  );

  const contentVisible = routeReadySelector
    ? page.locator(routeReadySelector).first().waitFor({ state: "visible", timeout: timeoutMs })
    : Promise.reject(new Error("No route ready selector"));

  const errorVisible = page.locator(".text-red-400").first().waitFor({ state: "visible", timeout: timeoutMs });

  try {
    await Promise.any([spinnerGone, contentVisible, errorVisible]);
  } catch {
    console.warn(`[screenshots] ready-check timeout for '${route}', continue with current render state.`);
  }
}

function getRouteReadySelector(route) {
  const map = {
    "/dashboard": ".dashboard-shell",
    "/calendar": ".calendar-shell",
    "/tags": ".page-shell .grid > *, .page-shell .space-y-2 > *",
    "/genres": ".page-shell .grid > *, .page-shell .space-y-2 > *",
    "/relations": ".page-shell .grid > *, .page-shell .space-y-2 > *",
    "/recommendation": ".page-shell .grid > *, .page-shell .space-y-2 > *",
    "/history": ".page-shell .grid > *, .page-shell .space-y-2 > *",
    "/compare": ".page-shell",
    "/combine": ".page-shell",
  };

  return map[route] ?? ".page-shell";
}
