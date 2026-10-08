# Author parsing

LibGen prints authors as free text in one table cell. The cell holds
`Maurya, Rahul; Maurya, Rahul`, `W. Richard Stevens & Stephen A. Rago`, or a
single name in capitals. `parseAuthors` turns it into a list of names. The code
is in [`src/parsers/authors/`](../src/parsers/authors/).

```ts
parseAuthors(authorText: string, publisherFallback?: string): string[]
```

[`parsers/search.ts`](../src/parsers/search.ts) calls it with the authors cell
and the publisher cell of each row. The function is not exported from the
package.

## Steps

1. Blank text returns `[]`.
2. Text in square brackets is removed from the whole string, because brackets
   interfere with comma detection.
3. A split strategy cuts the string into names.
4. Each name goes through the transforms. Names that end up empty are dropped.
5. The publisher fallback may replace the result.

## Split strategies

[`strategies.ts`](../src/parsers/authors/strategies.ts) lists the strategies in
`ALL_STRATEGIES`. The first whose `detect` returns true splits the string. Order
is priority.

In the table, "the word `and`" means `and` with a space on each side, and `&`
means `&` with a space on each side.

| Strategy           | Used when the text                                                                                                                                           | Splits on                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| `semicolon`        | contains `;`                                                                                                                                                 | `;`                                               |
| `period-delimited` | has neither the word `and` nor `&`, and has two or more words of three or more letters followed by a period and then a capital letter or the end of the text | the whitespace after a period that ends such word |
| `comma-and`        | contains a comma and either `, and ` or `, & `                                                                                                               | commas, then the word `and` or `&` inside a piece |
| `and`              | contains the word `and` or `&`                                                                                                                               | the word `and` or `&`                             |
| `comma`            | contains `,`                                                                                                                                                 | commas, with the exceptions below                 |
| `single`           | any other text                                                                                                                                               | nothing                                           |

Examples: `Составитель - Иванов. Иллюстрации - Петров.` is read by
`period-delimited` as two names (`Иванов`, `Петров`) after the transforms. A
name with initials, such as `Иванов И. Петров П.`, has no word of three or more
letters before a period, so it is not read by that strategy.

The `comma` strategy keeps a `Last, First` pair together and splits otherwise:

- Two parts are kept as one name when the first has at most three words and the
  second at most two. The transforms then reverse it.
- Three parts `Last, First, X`: when `X` is a generational suffix (`Jr`, `Sr`,
  `II`, `III`, `IV`, `Esq`, `PhD`, `MD`) or a title (`St`, `Dr`, `Prof`, `Sir`,
  `Rev`, `Fr`), with or without a period and in any case, the string stays one
  name and `reverseLastNameFirst` builds it. For any other `X` the result is two
  names, `First Last` and `X`: `Smith, John, Penguin Press` gives `John Smith`
  and `Penguin Press`, and `Smith, John, Lee` gives `John Smith` and `Lee`. If a
  part is empty, the parts are split as written: `Smith, John,` gives `Smith`
  and `John`.
- All other shapes split on every comma.

## Transforms

[`transforms.ts`](../src/parsers/authors/transforms.ts) lists the transforms in
`ALL_TRANSFORMS`. Each takes a name and returns a name. They run in this order:

| Transform              | Effect                                                                                                                                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `removeBrackets`       | Removes `[...]` and the spaces around it.                                                                                                                                                             |
| `removeParentheses`    | Removes `(...)` and the spaces around it.                                                                                                                                                             |
| `removePrefixes`       | Removes a leading `By` or `Illustrated By`, and the Russian role prefixes `Составитель -`, `Русский Текст -` and `Иллюстрации -`.                                                                     |
| `expandAbbreviations`  | Replaces a name that is only `coll`, `ed`, `eds`, `comp` or `trans`, with or without a period, by `Collection`, `Editor`, `Editors`, `Compiler` or `Translator`.                                      |
| `removeTrailingPeriod` | Removes a period after a final word of three or more letters. `Smith Jr.` and initials such as `J.` keep it.                                                                                          |
| `reverseLastNameFirst` | Turns `Last, First` into `First Last`. Turns `Last, First, Suffix` into `First Last Suffix` and `Last, First, Title` into `Title First Last`. Other shapes stay.                                      |
| `capitalizeWords`      | Capitalizes words written in a single case (`JOHN`, `smith`, `o'brien`). Mixed-case words (`McNelly`), words with a period, and URLs stay as they are. A last word `II`, `III` or `IV` is uppercased. |

The order matters. Brackets and prefixes go before abbreviations are expanded,
and the trailing period goes before the name is reversed.

## Publisher fallback

[`special-cases.ts`](../src/parsers/authors/special-cases.ts) handles rows where
LibGen puts a role in the author cell instead of a person. When the row has a
publisher, each parsed name that is `Collection`, `Editor`, `Editors`,
`Compiler` or `Translator` is replaced by the publisher name, which appears
once. Other names stay: `Collection; Smith, John` with publisher `Penguin` gives
`Penguin` and `John Smith`. The publisher text is cut from its first four-digit
number: `Penguin Books, 2005` becomes `Penguin Books`, and
`Penguin 1984 Classics` becomes `Penguin`. A row without a publisher keeps the
role.

## Add a name format

1. Add a strategy to `strategies.ts` with `detect()` and `split()`, and insert
   it in `ALL_STRATEGIES` at the position that gives it the priority it needs. A
   strategy placed above another takes the strings both detect.
2. Add a case to
   [`tests/author-parser.test.ts`](../tests/author-parser.test.ts).
3. Run `bun test`.

Add a transform the same way in `transforms.ts`, at its place in
`ALL_TRANSFORMS`.
