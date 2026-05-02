# Deployment

The browser game is a static app in `web/`, so it can be published with GitHub
Pages.

## GitHub Pages

This repository includes `.github/workflows/pages.yml`, which deploys the
contents of `web/` whenever `main` is pushed.

To enable it on GitHub:

1. Push the workflow to GitHub.
2. Open the repository on GitHub.
3. Go to `Settings` -> `Pages`.
4. Under `Build and deployment`, set `Source` to `GitHub Actions`.
5. Run the workflow or push to `main`.

The default public URL will be:

```text
https://ywp-sein.github.io/berlin_re_sim/
```

## Custom Domain

If you own a domain, add it in `Settings` -> `Pages` -> `Custom domain`.

For a subdomain such as `berlin.example.com`, create a DNS `CNAME` record:

```text
berlin.example.com -> ywp-sein.github.io
```

For an apex/root domain such as `example.com`, use the DNS records recommended
by GitHub Pages for apex domains.

After GitHub accepts the custom domain, it will preserve the domain in a `CNAME`
file. If you want this repo to track that explicitly, add `web/CNAME` containing
only the domain name.

Do not publish private or licensed data in `web/`; GitHub Pages output is public.
