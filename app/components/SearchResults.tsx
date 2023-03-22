import { useFetcher, Form } from "@remix-run/react";
import { useEffect, useState } from "react";
import type { listUsers } from "~/routes";
import { listRepos, loader } from "~/routes/repos/$userId";

interface SearchResultsProps {
  username: string | undefined;
  data: listUsers["data"]["items"];
}

interface FetchedData {
  [key: string]: {
    data: listRepos["data"];
    show: boolean;
    repos_count: number;
    current_page: number;
  };
}

const SearchResults = (props: SearchResultsProps) => {
  const fetcher = useFetcher();
  const [fetched, setFetched] = useState<FetchedData>({});
  useEffect(() => {
    if (fetcher.data && fetcher.type === "done") {
      setFetched((prevState) => ({
        ...prevState,
        [fetcher.data.username]: {
          data: [
            ...(typeof prevState[fetcher.data.username]?.data === "undefined"
              ? []
              : [...prevState[fetcher.data.username].data]),
            ...fetcher.data.data,
          ],
          show: true,
          repos_count: fetcher.data.repos_count,
          current_page: fetcher.data.current_page,
        },
      }));
    }
  }, [fetcher]);

  return (
    <div>
      <div className="mb-3 text-gray-400">
        Showing users for "{props.username}"
      </div>
      <section>
        {props.data.map((d) => (
          <div
            key={d.id}
            className="border-solid border-gray-200 border rounded-md mb-2 shadow-sm hover:shadow-md transition-all"
          >
            <fetcher.Form
              method="get"
              action="/repos/$userId"
              onSubmit={(e) => {
                e.preventDefault();
                if (typeof fetched[d.login] === "undefined") {
                  fetcher.submit(
                    { username: d.login, page: (1).toString() },
                    { method: "get", action: "/repos/$userId" }
                  );
                } else {
                  setFetched((prevState) => ({
                    ...prevState,
                    [d.login]: {
                      ...prevState[d.login],
                      show: !prevState[d.login].show,
                    },
                  }));
                }
              }}
            >
              <button
                tabIndex={0}
                type="submit"
                key={d.id}
                className={`w-full flex items-center px-4 py-2 cursor-pointer rounded-md  hover:bg-slate-50 transition-all ${
                  typeof fetched[d.login] !== "undefined" &&
                  fetched[d.login].show
                    ? "bg-slate-100"
                    : ""
                }`}
              >
                <div className="flex items-center">
                  <img
                    className="w-8 h-8 mr-3 rounded-full"
                    src={d.avatar_url}
                  />
                  <span>{d.login}</span>
                </div>
                <div className="ml-auto flex items-center">
                  {fetcher.state === "submitting" &&
                    fetcher.formData?.get("username") === d.login && (
                      <div className="loader ml-auto mr-2"></div>
                    )}
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={`w-5 h-5 transition-all ${
                        typeof fetched[d.login] !== "undefined" &&
                        fetched[d.login].show
                          ? "-rotate-180"
                          : ""
                      }`}
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </button>
              {typeof fetched[d.login] !== "undefined" &&
              fetched[d.login].show ? (
                <div className="px-4 py-2 border-t">
                  {fetched[d.login].data.length === 0 ? (
                    <div className="text-xs text-gray-400">Empty repo</div>
                  ) : (
                    <>
                      {fetched[d.login].data.map((repo) => (
                        <div
                          key={repo.id}
                          className="mb-2 pb-2 flex items-start border-b border-gray-100 last:border-b-0 last:pb-0"
                        >
                          <div className="pr-3">
                            <div></div>
                            <div>{repo.name}</div>
                            <div className="text-xs text-gray-400">
                              {repo.description === null
                                ? "No description"
                                : repo.description}
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 flex items-center mt-1 ml-auto">
                            {repo.stargazers_count}
                            <div className="text-yellow-400">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-3 h-3 ml-1"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ) : (
                <></>
              )}
            </fetcher.Form>

            {typeof fetched[d.login] !== "undefined" &&
              fetched[d.login].repos_count > fetched[d.login].data.length &&
              fetched[d.login].show && (
                <fetcher.Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (
                      typeof fetched[d.login] !== "undefined" &&
                      fetched[d.login].repos_count >
                        fetched[d.login].data.length
                    ) {
                      fetcher.submit(
                        {
                          username: d.login,
                          page: (fetched[d.login].current_page + 1).toString(),
                        },
                        { method: "get", action: "/repos/$userId" }
                      );
                    }
                  }}
                >
                  <button
                    type="submit"
                    tabIndex={0}
                    name="load_more"
                    value="load_more"
                    className="px-4 py-2 border-t border-slate-100 w-full text-blue-400 text-xs"
                  >
                    {fetcher.state === "submitting" &&
                    fetcher.formData?.get("username") === d.login ? (
                      <div className="flex items-center w-full justify-center">
                        <div className="loader-small"></div>
                        <span className="ml-1">Loading...</span>
                      </div>
                    ) : (
                      "Load more"
                    )}
                  </button>
                </fetcher.Form>
              )}
          </div>
        ))}
      </section>
    </div>
  );
};

export default SearchResults;
