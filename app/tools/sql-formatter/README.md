# SQL Formatter

**Status:** Implemented

A local, lightweight formatter for common SQL statements. It adjusts whitespace and keyword casing without sending SQL to a server or executing it.

## Important limitation

This is a **lexical formatter, not a SQL parser or SQL validator**. It recognizes common clause words and token boundaries; it does not understand every dialect, query structure, or semantic context. Formatting is not proof that a statement is valid. Review the output before using it, especially for dialect-specific SQL.

Quoted strings, quoted identifiers, `--` line comments, and `/* ... */` block comments are treated as protected tokens and their contents are preserved. Unterminated quoted tokens or comments are rejected. Input is limited to 100,000 characters.

## Example input

~~~sql
select id,name from users where active=true order by name;
~~~

## Options

- `keywordCase`: `upper` (default), `lower`, or `preserve`.
- `indent`: `2` (default) or `4` spaces for continuation lines.

Unknown options and unsupported option values are rejected.

## Processing and privacy

Formatting runs locally in the tool; SQL is not executed. No database connection is used. The formatter normalizes whitespace around common clauses and punctuation, separates statements, and preserves the original spelling and contents of quoted tokens and comments.

## Contribution files

- [definition.ts](definition.ts): metadata, sample input, and default options.
- [logic.ts](logic.ts): bounded tokenizer and formatter.
- [Tool.tsx](Tool.tsx): UI entry connected through `UniversalTool`.
- Focused tests: [tests/tools/sql-formatter.test.cjs](../../../tests/tools/sql-formatter.test.cjs).
