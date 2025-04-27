# Single Page Application (SPA) Fix for Vercel

The 404 NOT_FOUND error you're experiencing is a common issue with Single Page Applications (SPAs) on Vercel. This guide provides a specific solution for React SPA routing on Vercel.

## The Problem

When you deploy a React SPA to Vercel, client-side routing causes 404 errors when:
1. Users navigate to a route directly (e.g., typing it in the URL bar)
2. Users refresh the page on a route other than the root (/)
3. Users share a link to a specific route

This happens because Vercel's server doesn't know to serve the `index.html` file for these paths.

## The Solution: Create a Vercel Configuration File

Create a simple `vercel.json` file in your project root:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This tells Vercel to rewrite all requests to the index.html file, allowing your React router to handle the routing on the client side.

## Alternative Solution: Create a Static Version

If you keep getting 404 errors, create a simpler version by creating a file named `vercel.json` with:

```json
{
  "routes": [
    { "handle": "filesystem" },
    { "src": "/.*", "dest": "/index.html" }
  ]
}
```

## Using Vercel CLI for Deployment

Sometimes deploying through the Vercel CLI provides better results:

1. Install the Vercel CLI: `npm i -g vercel`
2. From your project directory, run: `vercel`
3. Follow the prompts
4. When it asks if you want to override settings, select "yes"
5. Set the output directory to `client/dist`

## If You Still Get 404 Errors

Try this most minimal approach:

1. Delete `vercel.json` entirely
2. In Vercel Dashboard, go to your project settings
3. Set "Framework Preset" to "Create React App"
4. Set "Output Directory" to `client/dist`
5. Redeploy

## Debugging Tips

- Use the Vercel CLI with the `--debug` flag to see more information: `vercel --debug`
- Check your browser's network tab to see exactly which resources are 404ing
- Try deploying just the built files (from `client/dist`) without the source code

Remember that the error ID format "lhr1::xxxx" indicates that your deployment is in the London (LHR1) region of Vercel, while your database appears to be in US East (IAD1). Aligning these regions might improve performance.