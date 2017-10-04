/* @flow */

export const input = `
  import { reify } from "flow-runtime";
  import type { Type } from "flow-runtime";

  type A = {a: number};
  type B = {a: A};
  type C = {b: B};

  const checkC = (reify: Type<C>);
`;

export const expected = `
  import { reify } from "flow-runtime";
  import { Type as _Type } from "flow-runtime";
  import t from "flow-runtime";
  const Type = t.tdz(() => _Type);

  const A = t.type("A", t.object(
    t.property("a", t.number())
  ));
  const B = t.type("B", t.object(
    t.property("a", A)
  ));
  const C = t.type("C", t.object(
    t.property("b", B)
  ));
  const checkC = C;
`

export const reifiedOnly = `
  import { reify } from "flow-runtime";
  import { Type as _Type } from "flow-runtime";
  import t from "flow-runtime";
  const Type = t.tdz(() => _Type);

  const A = t.type("A", t.object(
    t.property("a", t.number())
  ));
  const B = t.type("B", t.object(
    t.property("a", A)
  ));
  const C = t.type("C", t.object(
    t.property("b", B)
  ));
  const checkC = C;
`;
