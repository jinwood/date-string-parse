import {
  assertEquals,
} from "https://deno.land/std/testing/asserts.ts";
import { parse } from "./date.ts";

Deno.test("parse correctly subtracts 1 day", () => {
  const input = "now-1d";
  const expected = new Date(Date.UTC(2020, 4, 2));

  const result = parse(input);
  assertEquals(result, expected);
});
