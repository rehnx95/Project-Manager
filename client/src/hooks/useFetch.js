import { useCallback, useEffect, useState } from "react";

export function useFetch(fetcher, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revision, setRevision] = useState(0);
  const refetch = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetcher()
      .then((result) => { if (active) setData(result); })
      .catch((reason) => { if (active) setError(reason); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  // The caller supplies stable scalar dependencies describing its fetch.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, revision]);

  return { data, setData, loading, error, refetch };
}
