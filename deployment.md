# Deploy and obtain your new website URL

## Route A — GitHub Pages (free, recommended for public **synthetic static demo**)

1. Create a new GitHub repository named `soc-triage-lab`. Upload **all files in the zip**, preserving directories. Alternatively, locally:

   ```bash
   git init
   git add .
   git commit -m "Initial EvidenceGraph SOC Triage Lab v2"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/soc-triage-lab.git
   git push -u origin main
   ```

2. In GitHub, open **Settings → Pages** and set **Build and deployment → Source: GitHub Actions**.
3. The included `.github/workflows/deploy-pages.yml` builds and publishes the static demo on pushes to `main` (or manually with Run workflow).
4. Once the deployment action succeeds, your *new website link* will usually be:

   `https://YOUR-USERNAME.github.io/soc-triage-lab/`

   Replace `YOUR-USERNAME` with your actual GitHub username. This is a template, **not a live URL until deployed**.

5. Review **Settings → Pages** for the actual published URL. Do not upload API keys, production logs or your `.env` file.

**Note:** GitHub Pages runs static JavaScript; it will not execute FastAPI or connect to the model API. The fully interactive offline rules/evidence/decision demo still works there.

## Route B — local optional LLM

```bash
pip install -r requirements.txt
export OPENAI_API_KEY='YOUR_SERVER_SIDE_KEY'
uvicorn server.app:app --host 127.0.0.1 --port 8080
```

Model requests are routed from the browser to this *same-origin* API backend. LLM results are constrained JSON with source-ID validation and displayed as unverified suggestions. They are distinct from the deterministic demo rule score. Do not expose this backend to the internet as-is: it has no end-user authentication, quota or enterprise security controls.

## Legacy website

The existing `https://soc-triage-lab.abakerbaba.chatgpt.site` is an earlier, **separate** version. These GitHub sources **do not change it** and the rebuild has not been deployed there.
