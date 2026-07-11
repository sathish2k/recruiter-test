import Box from "@mui/material/Box";
import { C, H2, Lead, P, PageTitle } from "../../components/doc";
import { RouteResolver } from "../../demos/RouteResolver";

export default function PlaygroundPage() {
  return (
    <Box>
      <PageTitle>Playground</PageTitle>
      <Lead>
        Resolve any path against the engine, live. This is the same{" "}
        <code>findRouteBySlug</code> / <code>generateRenderTree</code> the app
        runs — nothing is mocked.
      </Lead>

      <H2>Resolver</H2>
      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          p: 3,
          bgcolor: "#faf9fe",
        }}
      >
        <RouteResolver />
      </Box>

      <H2>Notes</H2>
      <P>
        Try <C>/candidates/list</C> after adding a static <C>list</C> child — it
        outranks <C>:id</C> (+2 vs +1). An unmatched path returns <C>null</C>{" "}
        and the renderer shows the 404 page.
      </P>
    </Box>
  );
}
