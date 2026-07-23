import { Suspense } from "react";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

import ResultsPageContent from "./page-content";

const ResultsPage = () => {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: 360,
            display: "grid",
            placeItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <ResultsPageContent />
    </Suspense>
  );
};

export default ResultsPage;