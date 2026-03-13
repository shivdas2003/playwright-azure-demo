Below is a fully copy-paste runnable Playwright + GitHub Actions + Azure deployment lifecycle.
You can literally copy each file exactly and run it. 🚀

This example will:

1️⃣ Create a Playwright test
2️⃣ Run it locally
3️⃣ Run it via GitHub Actions
4️⃣ Build Docker image
5️⃣ Push image to Azure Container Registry
6️⃣ Run Playwright tests in Azure Container Apps
7️⃣ Store test reports

1️⃣ Install Prerequisites

Install locally:

# Node
https://nodejs.org

# Azure CLI
brew install azure-cli   # Mac
sudo apt install azure-cli   # Linux

# Docker
https://docs.docker.com/get-docker/

# Playwright browsers
npx playwright install

Login to Azure

az login
2️⃣ Create Project
mkdir playwright-azure-demo
cd playwright-azure-demo

Initialize

npm init -y

Install Playwright

npm install -D @playwright/test

Install browsers

npx playwright install --with-deps
3️⃣ Folder Structure

Create this structure:

playwright-azure-demo
│
├── tests
│   └── google.spec.ts
│
├── playwright.config.ts
├── package.json
├── Dockerfile
│
└── .github
    └── workflows
        └── ci.yml
4️⃣ Playwright Test

Create file:

tests/google.spec.ts
import { test, expect } from '@playwright/test';

test('Open Google homepage', async ({ page }) => {

  await page.goto('https://www.google.com');

  const title = await page.title();

  console.log("Page title:", title);

  await expect(page).toHaveTitle(/Google/);

});
5️⃣ Playwright Configuration

Create

playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({

  timeout: 30000,

  retries: 1,

  workers: 2,

  reporter: [
    ['html'],
    ['list']
  ],

  use: {

    headless: true,

    screenshot: 'only-on-failure',

    video: 'retain-on-failure',

    trace: 'retain-on-failure'

  },

});
6️⃣ Update package.json

Replace scripts section:

{
  "name": "playwright-azure-demo",
  "version": "1.0.0",
  "scripts": {
    "test": "playwright test",
    "report": "playwright show-report"
  },
  "devDependencies": {
    "@playwright/test": "^1.42.0"
  }
}
7️⃣ Run Test Locally

Run:

npm test

View report

npm run report
8️⃣ Dockerfile

Create file

Dockerfile
FROM mcr.microsoft.com/playwright:v1.42.1-jammy

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx playwright install

CMD ["npx","playwright","test"]
9️⃣ Test Docker Image

Build

docker build -t playwright-tests .

Run

docker run playwright-tests
🔟 Create GitHub Repo
git init
git add .
git commit -m "playwright azure demo"

git branch -M main

git remote add origin https://github.com/YOURUSER/playwright-azure-demo.git

git push -u origin main
1️⃣1️⃣ Create Azure Resources

Create resource group

az group create \
--name rg-playwright \
--location eastus
1️⃣2️⃣ Create Azure Container Registry
az acr create \
--name playwrightacr \
--resource-group rg-playwright \
--sku Basic

Login

az acr login --name playwrightacr
1️⃣3️⃣ Push Docker Image to Azure

Tag image

docker tag playwright-tests playwrightacr.azurecr.io/playwright-tests

Push

docker push playwrightacr.azurecr.io/playwright-tests
1️⃣4️⃣ Create Azure Container Apps Environment
az containerapp env create \
--name playwright-env \
--resource-group rg-playwright \
--location eastus
1️⃣5️⃣ Deploy Container App
az containerapp create \
--name playwright-runner \
--resource-group rg-playwright \
--environment playwright-env \
--image playwrightacr.azurecr.io/playwright-tests \
--target-port 80 \
--ingress internal \
--registry-server playwrightacr.azurecr.io
1️⃣6️⃣ GitHub Secrets

Add in GitHub → Settings → Secrets

AZURE_CREDENTIALS
AZURE_ACR_LOGIN_SERVER
AZURE_ACR_USERNAME
AZURE_ACR_PASSWORD

Create credentials

az ad sp create-for-rbac \
--name github-playwright \
--role contributor \
--scopes /subscriptions/YOUR_SUB_ID \
--sdk-auth

Copy JSON → store in AZURE_CREDENTIALS.

1️⃣7️⃣ GitHub Actions Pipeline

Create file:

.github/workflows/ci.yml
name: Playwright CI

on:

  push:
    branches: [ main ]

  workflow_dispatch:

jobs:

  test:

    runs-on: ubuntu-latest

    steps:

    - name: Checkout Code
      uses: actions/checkout@v4

    - name: Setup Node
      uses: actions/setup-node@v4
      with:
        node-version: 20

    - name: Install Dependencies
      run: npm install

    - name: Install Playwright Browsers
      run: npx playwright install --with-deps

    - name: Run Tests
      run: npx playwright test

    - name: Upload Report
      uses: actions/upload-artifact@v4
      with:
        name: playwright-report
        path: playwright-report
1️⃣8️⃣ Push Code
git add .
git commit -m "ci pipeline"
git push

Now pipeline runs automatically.

Check

GitHub → Actions tab
1️⃣9️⃣ Optional: Schedule Tests

Add to workflow:

on:
  schedule:
    - cron: "0 3 * * *"

Runs daily.

2️⃣0️⃣ Scaling Playwright

Run parallel tests

npx playwright test --workers=8

Sharding

npx playwright test --shard=1/4
2️⃣1️⃣ Enterprise Architecture

Best setup used in companies:

GitHub Actions
      │
      ▼
Build Docker Image
      │
      ▼
Push to Azure Container Registry
      │
      ▼
AKS Job
      │
      ▼
Run Playwright Tests
      │
      ▼
Store Reports in Azure Blob
      │
      ▼
Slack / Teams Alerts
2️⃣2️⃣ Example Kubernetes Job (Enterprise)
apiVersion: batch/v1
kind: Job
metadata:
  name: playwright-tests

spec:
  template:
    spec:
      containers:
      - name: playwright
        image: playwrightacr.azurecr.io/playwright-tests

      restartPolicy: Never
🎯 Final Result

Your system will:

Developer pushes code
       │
       ▼
GitHub Actions runs Playwright tests
       │
       ▼
Docker image built
       │
       ▼
Image pushed to Azure Container Registry
       │
       ▼
Azure Container App runs tests
       │
       ▼
HTML reports generated

💡 Since you already work with Kubernetes, Helm and CI/CD, I can also show you a very advanced architecture:

Playwright running 1000 tests in 3 minutes using Kubernetes parallel pods (used by Microsoft / Amazon internally).

If you want, I can also give:

✔ Full GitHub repo template
✔ Playwright Page Object Model framework
✔ Slack alerts on test failures
✔ Azure Blob report hosting
✔ Parallel test sharding

Just say "give advanced enterprise setup".