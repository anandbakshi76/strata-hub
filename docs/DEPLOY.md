# Deploying Strata Hub

A step-by-step guide for the person. The agent never deploys (PROCESS.md, Releasing). Strata Hub is a static site: Netlify builds it from the GitHub repository with the settings in `netlify.toml` and serves `dist/`.

## Before you start

- A Netlify account (free), signed in with GitHub.
- `main` on GitHub holds the release you want, and `npm run check` passed on it.
- Tag the release on your computer so you can always go back to it: `git tag v1.0.0` then `git push origin v1.0.0`.

## Deploy to Netlify

1. In Netlify, choose **Add new site**, then **Import an existing project**, then **GitHub**.
2. Pick the repository `anandbakshi76/strata-hub`.
3. Netlify reads `netlify.toml`: build command `npm run build`, publish directory `dist`, Node 26. Leave the fields as they are and choose **Deploy**.
4. When the deploy finishes, Netlify shows the site's address, such as `https://strata-hub.netlify.app`.
5. Under **Site configuration**, **Site details**, **Change site name**, set the name to `strata-hub` if it is free.

If the address is not `https://strata-hub.netlify.app` (the name was taken, or you use a custom domain), the page's search and sharing links must change to match. Replace the address in these three files, commit on a branch and merge as usual:

- `web/index.html` (the canonical link and the `og:url` and `og:image` tags)
- `web/public/robots.txt`
- `web/public/sitemap.xml`

From then on, every merge to `main` deploys by itself. Pull requests get a preview address of their own.

## Custom domain

1. In Netlify, open **Domain management** and choose **Add a domain**. Enter the domain, for example `strata.example.com`.
2. Netlify shows the DNS record to add. At the company that holds the domain, add it:
   - for a subdomain such as `strata.example.com`: a **CNAME** record pointing to your Netlify address (`strata-hub.netlify.app`);
   - for the bare domain `example.com`: Netlify's **A** record, or move the domain's DNS to Netlify.
3. Wait for DNS to update (minutes, sometimes a few hours). Netlify then issues the HTTPS certificate by itself. Under **HTTPS**, check that the certificate shows as active.
4. Set the custom domain as the **primary domain**, so the Netlify address redirects to it.
5. Change the address in the three files listed above, then merge.

## Roll back

If a release is wrong, go back to the last good one:

1. In Netlify, open **Deploys**, choose the last good deploy, then **Publish deploy**. The site switches at once, and automatic deploys pause until you turn them back on.
2. Fix the problem on a branch, merge it, then under **Deploys** choose **Unlock** or **Start auto publishing** again.

Without Netlify's page, undo the bad merge in GitHub: open the merged pull request and choose **Revert**. GitHub opens a new pull request that undoes it; merge that, and Netlify deploys the reverted `main`.

Or on your computer (pull requests here are merge commits, so `-m 1` is needed):

```
git switch main
git pull
git switch -c revert-bad-release
git revert -m 1 <the merge commit's id>
git push -u origin revert-bad-release
```

Then open and merge the pull request for `revert-bad-release`.

## Rehearse a rollback

Do this once, right after the first deploy and before you share the address, and again after any change to how the site deploys. Netlify needs two deploys to roll back between, so the rehearsal makes the second one:

1. Merge a harmless change, for example one line added to `CHANGELOG.md`. Netlify deploys it; **Deploys** now lists two deploys.
2. In **Deploys**, choose the first deploy, then **Publish deploy**. Open the address and check the page still loads.
3. Choose **Start auto publishing** (or **Unlock**) so merges deploy by themselves again, then publish the newest deploy.
4. Write the date and your name in `docs/RUNBOOK.md`, on the line "Last rehearsed on".

## After you deploy

1. Open the address. "One hub. Every room." shows, and scrolling down takes the hub apart and back together.
2. Check the page in **Firefox** and **Safari** (deferred from phase 3): it loads, the 3D runs, the browser console shows no errors.
3. Run Lighthouse on the live address from Chrome's developer tools (Lighthouse tab, Mobile): main content under 2.5 seconds, accessibility 95 or more.
4. Paste the address into a LinkedIn or Slack message to check the share preview shows the image and title.
5. Check the security headers reached the live site. On Windows run `curl.exe -I <address>` (in PowerShell, plain `curl` is a different command); on a Mac run `curl -I <address>`. The response shows `content-security-policy` and `x-content-type-options: nosniff`. Or in the browser: developer tools, **Network**, the page's first request, **Response headers**.

## Vercel instead

The same steps work on Vercel: import the repository, set the output directory to `dist` and the build command to `npm run build`, Node 26. Vercel does not read `netlify.toml`, so add the headers in a `vercel.json`, and roll back from **Deployments** with **Instant Rollback**.
