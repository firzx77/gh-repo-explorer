import * as RTL from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/dom";
import * as Mocks from "~/mocks";

import * as RemixServer from "@remix-run/cloudflare";
import * as RemixReact from "@remix-run/react";

import {
  Form,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";
import type { ErrorBoundaryComponent, LoaderArgs } from "@remix-run/cloudflare";
import { Octokit } from "octokit";
import { Endpoints } from "@octokit/types";
import { useRef } from "react";
import Init from "~/components/Init";
import Loading from "~/components/Loading";
import NotFound from "~/components/NotFound";
import SearchResults from "~/components/SearchResults";
import Error from "~/components/Error";
import HomeIllustration from "~/components/HomeIllustration";
import Footer from "~/components/Footer";

export type listUsers = Endpoints["GET /search/users"]["response"];

interface UIState {
  state: "INIT" | "LOADING" | "NOTFOUND" | "SEARCHRESULTS" | "ERROR";
}

interface IndexProps {
  error?: ErrorEvent;
}

export async function loader({ context, request }: LoaderArgs) {
  const octokit = new Octokit({
    auth: context.GH_TOKEN,
  });

  const url = new URL(request.url);
  const username = url.searchParams.get("username") ?? "";

  let users: listUsers["data"]["items"] = [];

  if (username !== "") {
    const res = await octokit.request("GET /search/users", {
      q: username,
      per_page: 5,
    });
    users = res.data.items;
  }

  return users;
}

const views: {
  [key: string]: (props: {
    username: string;
    data: listUsers["data"]["items"];
    error: string;
  }) => React.ReactElement;
} = {
  INIT: () => <Init />,
  LOADING: () => <Loading />,
  NOTFOUND: (props) => <NotFound username={props.username} />,
  SEARCHRESULTS: (props) => (
    <SearchResults data={props.data} username={props.username} />
  ),
  ERROR: (props) => <Error error={props.error} />,
};

export default function Index({ error }: IndexProps) {
  const data = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const state = useRef<UIState["state"]>("INIT");
  const navigation = useNavigation();

  if (error) {
    state.current = "ERROR";
  } else if (navigation.state === "idle" && data?.length > 0) {
    state.current = "SEARCHRESULTS";
  } else if (
    navigation.state === "idle" &&
    data?.length === 0 &&
    searchParams.get("username") === ""
  ) {
    state.current = "INIT";
  } else if (
    navigation.state === "idle" &&
    data?.length === 0 &&
    searchParams.get("username") !== null
  ) {
    state.current = "NOTFOUND";
  }

  console.log("state.current", state.current, data, navigation);

  return (
    <div className="bg-slate-300 min-h-screen">
      <div className="ml-auto mr-auto max-w-xl pt-5 pb-10 min-h-screen flex items-center justify-center flex-col">
        <div className="w-full rounded-lg shadow-lg bg-white px-8 pb-5 pt-20 min-h-[600px] relative">
          <HomeIllustration />
          <h1 className="text-xl pb-5 pt-3 text-center relative z-10">
            GitHub repositories explorer
          </h1>
          <Form
            data-testid="search-form"
            id="search"
            method="get"
            onSubmit={() => {
              const formData = Object.fromEntries(
                new FormData(
                  document.getElementById("search") as HTMLFormElement
                )
              );
              if (formData.username === "") {
                state.current = "INIT";
              } else {
                state.current = "LOADING";
              }
            }}
          >
            <div className="relative mb-10 max-w-sm ml-auto mr-auto">
              <div className="absolute top-0 left-0 h-full flex items-center pl-3 text-gray-500">
                {state.current === "LOADING" ? (
                  <div className="loader"></div>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <input
                data-testid="search-input"
                defaultValue={searchParams.get("username") ?? ""}
                name="username"
                className="rounded-full h-10 pl-12 pr-5 w-full shadow-md border border-slate-100"
                placeholder="github username"
              />
            </div>
          </Form>
          <div data-testid="screen-wrapper" className="relative">
            {views[state.current]({
              data,
              username: searchParams.get("username") ?? "",
              error: error?.message ?? "",
            })}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export const ErrorBoundary = Index;

if (process.env.NODE_ENV === "test" && import.meta.vitest) {
  let { describe, test, expect, vi } = import.meta.vitest;

  vi.mock("@remix-run/react", () => Mocks.createRemixReactMock({ path: "/" }));
  let RemixReactMock = RemixReact as unknown as ReturnType<
    typeof Mocks.createRemixReactMock
  >;

  describe("component", () => {
    beforeEach(() => {
      RemixReactMock.useLoaderData.mockReturnValue([]);
      RemixReactMock.useSearchParams.mockReturnValue([new URLSearchParams()]);
      RemixReactMock.useNavigation.mockReturnValue({
        formAction: undefined,
        formData: undefined,
        formEncType: undefined,
        formMethod: undefined,
        location: undefined,
        state: "idle",
      });
    });

    test("render search input", () => {
      let { getByTestId } = RTL.render(<Index />);
      expect(getByTestId("search-input")).toBeDefined();
    });

    test("query params reflect in search input value", () => {
      RemixReactMock.useSearchParams.mockReturnValue([
        new URLSearchParams({
          username: "John",
        }),
      ]);
      let { getByTestId } = RTL.render(<Index />);
      expect(getByTestId("search-input").getAttribute("value")).toBe("John");
    });

    test("should show init screen, when query params empty", () => {
      RemixReactMock.useSearchParams.mockReturnValue([new URLSearchParams({})]);
      let { getByTestId } = RTL.render(<Index />);
      expect(getByTestId("init")).toBeDefined();
    });

    test("should show notfound screen, and match query params", () => {
      RemixReactMock.useSearchParams.mockReturnValue([
        new URLSearchParams({
          username: "test12345",
        }),
      ]);
      RemixReactMock.useLoaderData.mockReturnValue([]);
      let { getByTestId } = RTL.render(<Index />);
      expect(getByTestId("notfound-text").textContent).toBe(
        'No user found for "test12345".'
      );
    });
  });
}
