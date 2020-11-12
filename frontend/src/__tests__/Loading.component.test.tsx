/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ComponentType } from "react";
import { render, cleanup } from "@testing-library/react";
import { Loading } from "../components/Loading/loading.component";
import { defaultLoadingDomId } from "../components/Loading/loading-dom";
import { act } from "react-dom/test-utils";
import { onUnmount } from "../components/Loading/loading.injectables";
import { MAX_TIMEOUT_MS } from "../utils/timers";

jest.mock("../components/Loading/loading.injectables");
const mockOnUnmount = onUnmount as jest.Mock;

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  cleanup();
  jest.clearAllTimers();
  jest.resetAllMocks();
});

it("renders loading UI", () => {
  const { ui } = makeComp();
  render(ui);

  // loading UI will be visible after timer completes
  expect(document.getElementById(defaultLoadingDomId)).toBeNull();

  act(() => {
    jest.runTimersToTime(MAX_TIMEOUT_MS);
  });

  expect(document.getElementById(defaultLoadingDomId)).not.toBeNull();
});

it("does not render loading UI", () => {
  const { ui } = makeComp({
    props: {
      loading: false,
    },
  });
  render(ui);

  // loading UI will never be rendered
  expect(document.getElementById(defaultLoadingDomId)).toBeNull();

  act(() => {
    jest.runTimersToTime(MAX_TIMEOUT_MS);
  });

  // loading UI will never be rendered
  expect(document.getElementById(defaultLoadingDomId)).toBeNull();
});

it("executes clean up code", () => {
  const { ui } = makeComp({
    props: {
      loading: false,
    },
  });
  const { unmount } = render(ui);

  expect(mockOnUnmount).not.toHaveBeenCalled();

  unmount();
  expect(mockOnUnmount).not.toHaveBeenCalled();
});

////////////////////////// HELPER FUNCTIONS ///////////////////////////

const LoadingP = Loading as ComponentType<Partial<{}>>;

function makeComp({ props = {} }: { props?: Partial<{}> } = {}) {
  return {
    ui: <LoadingP {...props} />,
  };
}
