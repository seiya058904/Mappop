// Keep the historical entry point so old commands fail clearly without loading
// network dependencies. Mappop uses external AI tools and file-based imports.
console.error(
  'Mappop: the legacy AI proxy is retired and will not start. Use Import to open an outline from your external AI tool. See docs/DEPLOYMENT.md.'
)
process.exitCode = 1
