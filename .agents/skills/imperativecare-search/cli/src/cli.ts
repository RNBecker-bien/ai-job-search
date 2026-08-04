import { createCLI } from "@bunli/core"
import { search } from "./commands/search.js"
import { detail } from "./commands/detail.js"

const cli = await createCLI({
  name: "imperativecare-cli",
  version: "1.0.0",
  description: "CLI for searching jobs across ApplyToJob (JazzHR)-hosted company careers pages",
})

cli.command(search)
cli.command(detail)

await cli.run()
