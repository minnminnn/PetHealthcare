import assert from "node:assert/strict";
import test from "node:test";
import { matchClinicNames, normalizePhone } from "./clinic-name-matching";
const reference = [
  {
    name: "PetHealth",
    address: "Số 55, Trần Quang Diệu, Đống Đa",
    phone: "0961.319.682",
  },
  {
    name: "VetFamily",
    address: "Phân khu Sapphire, Tây Mỗ, Nam Từ Liêm",
    phone: null,
  },
];
test("clinic matching normalizes Vietnamese accents, punctuation and Vietnam phone prefixes", () => {
  assert.equal(normalizePhone("+84 961 319 682"), "0961319682");
  assert.equal(normalizePhone("0084 24 3202 0082"), "02432020082");
  const result = matchClinicNames(
    [
      {
        id: "a",
        name: " ",
        address: "55 Tran Quang Dieu, Dong Da",
        phone: "+84 961 319 682",
        slug: "existing",
      },
    ],
    reference,
  );
  assert.equal(result.updated[0]?.name, "PetHealth");
  assert.equal(result.updated[0]?.slug, "existing");
});
test("existing names and contradictory, duplicate or address-only matches are never overwritten", () => {
  const current = [
    {
      name: "Existing",
      address: reference[0]!.address,
      phone: reference[0]!.phone,
    },
    { name: "", address: "99 Khac", phone: reference[0]!.phone },
    { name: null, address: reference[1]!.address, phone: null },
    { name: "", address: "Unknown", phone: "000" },
  ];
  assert.deepEqual(matchClinicNames(current, reference).updated, current);
  assert.equal(
    matchClinicNames(
      [current[1]!],
      [...reference, { ...reference[0]!, name: "Other branch" }],
    ).report[0]?.status,
    "review",
  );
});
