/**
 * Neural Chat Bot - Static HTML Builder & Assembler
 * Modularizes index.html into components and compiles from data/portfolio.json
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_INDEX = path.join(ROOT_DIR, 'src', 'index.html');
const DEST_INDEX = path.join(ROOT_DIR, 'index.html');
const PORTFOLIO_JSON = path.join(ROOT_DIR, 'data', 'portfolio.json');

function renderPortfolioCards() {
  if (!fs.existsSync(PORTFOLIO_JSON)) {
    console.warn(`[Build] Warning: ${PORTFOLIO_JSON} not found. Skipping portfolio render.`);
    return '';
  }

  const raw = fs.readFileSync(PORTFOLIO_JSON, 'utf8');
  let projects = [];
  try {
    projects = JSON.parse(raw);
  } catch (err) {
    console.error('[Build] Failed to parse portfolio.json:', err.message);
    return '';
  }

  const cardsHtml = projects.map(item => {
    const cardClass = item.isFeatured
      ? 'portfolio-project-card featured-flagship-card'
      : 'portfolio-project-card';
    const iconStyle = item.iconStyle ? ` style="${item.iconStyle}"` : '';
    const catStyle = item.categoryStyle ? ` style="${item.categoryStyle}"` : '';
    const tagsHtml = (item.tags || [])
      .map(t => `<span class="portfolio-tech-tag">${t}</span>`)
      .join('\n              ');
    const isExternal = item.liveUrl && item.liveUrl.startsWith('http');
    const targetRel = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
    const liveIcon = item.liveIcon || 'fa-solid fa-arrow-up-right-from-square';
    const liveText = item.liveText || 'Live Demo';

    return `        <!-- Project: ${item.title} -->
        <div class="${cardClass}">
          <div>
            <div class="portfolio-card-top">
              <div class="portfolio-project-icon"${iconStyle}>
                <i class="${item.icon}"></i>
              </div>
              <span class="portfolio-category-badge"${catStyle}>${item.category}</span>
            </div>
            <h3 class="portfolio-project-title">${item.title}</h3>
            <p class="portfolio-project-desc">
              ${item.description}
            </p>
            <div class="portfolio-tech-tags">
              ${tagsHtml}
            </div>
          </div>
          <div class="portfolio-card-actions">
            <a href="${item.liveUrl}"${targetRel} class="btn btn-live">
              <i class="${liveIcon}"></i> ${liveText}
            </a>
            <a href="${item.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-github">
              <i class="fa-brands fa-github"></i> Code
            </a>
          </div>
        </div>`;
  }).join('\n\n');

  return cardsHtml;
}

function processIncludes(templateContent) {
  const includeRegex = /<!--\s*include:\s*([^\s]+)\s*-->/g;

  return templateContent.replace(includeRegex, (match, includePath) => {
    const fullPath = path.isAbsolute(includePath)
      ? includePath
      : path.join(ROOT_DIR, includePath);

    if (!fs.existsSync(fullPath)) {
      console.error(`[Build Error] Component not found: ${fullPath}`);
      return `<!-- Error: Component not found (${includePath}) -->`;
    }

    let fileContent = fs.readFileSync(fullPath, 'utf8');

    // If portfolio grid placeholder exists inside this component
    if (fileContent.includes('<!-- PORTFOLIO_PROJECTS_GRID -->')) {
      const portfolioCards = renderPortfolioCards();
      fileContent = fileContent.replace('<!-- PORTFOLIO_PROJECTS_GRID -->', portfolioCards);
    }

    // Recursively process nested includes if any
    return processIncludes(fileContent);
  });
}

function build() {
  const startTime = Date.now();

  if (!fs.existsSync(SRC_INDEX)) {
    console.error(`[Build Error] Source index not found at ${SRC_INDEX}`);
    return false;
  }

  const srcTemplate = fs.readFileSync(SRC_INDEX, 'utf8');
  const compiledHtml = processIncludes(srcTemplate);

  fs.writeFileSync(DEST_INDEX, compiledHtml, 'utf8');

  const lineCount = compiledHtml.split('\n').length;
  const sizeKb = (Buffer.byteLength(compiledHtml, 'utf8') / 1024).toFixed(1);
  const elapsed = Date.now() - startTime;

  console.log(`[Build] Output created successfully: index.html (${lineCount} lines, ${sizeKb} KB) in ${elapsed}ms`);
  return true;
}

if (require.main === module) {
  build();
}

module.exports = { build };
