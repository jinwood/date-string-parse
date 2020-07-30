const NOW_DATE = "2020-05-01T00:00:00";
enum ParseState {
  ExpectingOperator,
  ExpectingDate,
  ExpectingNumber,
  ExpectingIdentifier,
}

enum Token {
  Identifier,
  Now,
  Round,
  Number,
}

const DATE_MODIFIERS = {
  "d": (date: Date, number: number) => date.setDate(date.getDate() + number),
  "M": (date: Date, number: number) => date, // Todo: Implement other functions
  "y": (date: Date, number: number) => date,
  "h": (date: Date, number: number) => date,
  "m": (date: Date, number: number) => date,
  "s": (date: Date, number: number) => date,
  "w": (date: Date, number: number) => date,
};

const VALID_IDENTIFIERS = new Set(Object.keys(DATE_MODIFIERS));

function* scanner(
  buffer: string,
): Generator<[Token, string] | [Token, number] | [Token]> {
  let acc = "";
  for (const char of buffer) {
    if (!acc && (char === "+" || char === "-")) {
      acc = char;
      continue;
    }

    if (char >= "0" && char <= "9") {
      acc += char;
      continue;
    }
    if (acc && char === "n") {
      throw new Error("Invalid token");
    }

    if (!acc && char === "n") {
      acc += char;
      continue;
    }

    if (char === "o" && acc === "n") {
      acc += char;
      continue;
    }

    if (char === "w" && acc === "no") {
      yield [Token.Now];
      acc = "";
      continue;
    }

    if (acc === "n" || acc === "no") {
      throw new Error("Invalid token");
    }

    if (acc) {
      yield [Token.Number, Number(acc)];
      continue;
    }

    if (char === "/") {
      yield [Token.Round];
      continue;
    }

    yield [Token.Identifier, char];
  }
}

export function parse(dateString: string): Date {
  let state = ParseState.ExpectingDate;
  let date = null;
  let operator = "";
  let number = null;

  for (const [token, value] of scanner(dateString)) {
    console.log(Token[token], value);
    if (token === Token.Now && state !== ParseState.ExpectingDate) {
      throw new Error("Invalid Token.Now");
    }

    if (token === Token.Round && state !== ParseState.ExpectingOperator) {
      throw new Error(`Invalid ${Token[token]}`);
    }

    if (
      token === Token.Number &&
      (state !== ParseState.ExpectingNumber &&
        state !== ParseState.ExpectingOperator)
    ) {
      throw new Error(`Invalid ${Token[token]}`);
    }

    if (
      token === Token.Identifier &&
      !(VALID_IDENTIFIERS.has(value as any))
    ) {
      throw new Error(`Invalid identifier ${value}`);
    }

    if (token === Token.Now) {
      date = new Date(NOW_DATE);
      state = ParseState.ExpectingOperator;
    }

    if (token === Token.Round) {
      operator = String(value);
      state = operator === "/"
        ? ParseState.ExpectingIdentifier
        : ParseState.ExpectingNumber;
    }

    if (token === Token.Identifier && operator === "/") {
      if (value === "y") {
        // round to nearest year
        // implement DateTime parsing
      }
    }

    if (token === Token.Number) {
      state = ParseState.ExpectingIdentifier;
      number = value;
      continue;
    }

    if (
      token === Token.Identifier && typeof value === "string" &&
      VALID_IDENTIFIERS.has(value)
    ) {
      console.log(date);
      // @ts-ignore
      DATE_MODIFIERS[value](date, number);
    }
  }
  return date!;
}
