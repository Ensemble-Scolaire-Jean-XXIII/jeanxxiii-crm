import { useState } from "react";

export function usePagination(initialPage = 1, initialTotalPages = 1) {
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  const next = () => setPage((p) => Math.min(totalPages, p + 1));
  const prev = () => setPage((p) => Math.max(1, p - 1));
  const reset = () => setPage(1);

  return {
    page,
    setPage,
    totalPages,
    setTotalPages,
    next,
    prev,
    reset,
  };
}
