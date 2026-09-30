# Fill missing clinic names

`data/clinic-name-reference.json` contains the 30 names, addresses and phone numbers supplied by the user. The list is treated as input data, not independently verified business information. VetFamily has no supplied phone number.

Provide the current records as a JSON array with `id`, `name`, `address`, `phone` and any additional fields:

```bash
npm run clinics:match -- current.json updated.json
```

The command writes a valid JSON array to `updated.json` and a separate audit list to `updated.json.report.json`. Existing files are never overwritten and no database is contacted.

- Accents, address punctuation, and common address prefixes are normalized for comparison.
- Phone punctuation and `+84` / `0084` country prefixes are normalized.
- A missing/blank name is filled automatically only when the phone and normalized address identify exactly one reference entry.
- Existing nonblank names are preserved. All other record fields, IDs and order are preserved.
- Conflicting matches, phone-only matches and address-only matches are listed as `review`. VetFamily requires address review because its reference phone is missing.
- More approximate address variants may remain unmatched; they are not guessed.

No current-data file was included with the initial reference-list request. The reference file is not an updated database export. Run the tool on the actual records or provide that JSON before treating a result as a database patch. If importing into the project's Clinic table, recompute the derived `nameUnaccented` field for renamed rows in the import transaction.
