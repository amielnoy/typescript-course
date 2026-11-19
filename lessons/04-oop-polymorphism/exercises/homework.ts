// Lesson 4 – Homework: Form Robot – fields that fill, validate and describe themselves
// ------------------------------------------------------------
// Scenario:
//   The e2e suite fills long sign-up forms, and every test used to repeat the same code: trim the text,
//   lower-case the e-mail, hide the password in the log, tick the checkbox, pick a dropdown option...
//   and a different if/else for every kind of field. The QA team decided on a small "form robot":
//   every field knows how to fill itself, validate its value and describe itself, and the Form works
//   ONLY through the base type UiField – so a new kind of field never changes the Form.
//
// Instructions:
//   1. The tasks build on each other – solve them in order. Fill in every  throw new Error("TODO")
//      (and, where a task says so, add the members that are missing).
//   2. Use only what we have learned so far: classes, public / private / protected / readonly, # fields,
//      getters, extends / super / override, and arrays typed as the base class (polymorphism).
//      (No abstract classes yet – UiField is a regular class that works on its own.)
//   3. No instanceof and no if/switch on the kind of field – let polymorphism do the work.
//      A subclass changes only what is different, and reuses the parent with super.
//   4. Remember (noImplicitOverride): a method that replaces the parent's one needs override.
//   5. Check yourself: npm run exercise -- 04 hw (self-check at the end of the file)
// ------------------------------------------------------------

export type FormData = Record<string, string>; // field id -> the text to type

/**
 * Task 1 – UiField: the base class (encapsulation)
 * The state lives in # fields: #value (starts as ""), #fills (how many successful fills) and #disabled.
 * Nobody outside can change them – only read them through the getters value, fills and disabled.
 * - disable()       – from now on every fill throws
 * - normalize(input) (protected) – how the typed text is cleaned. Here: trim()
 * - display()       – how the value is shown in a log: '"<value>"', or "(empty)" when the value is ""
 * - describe()      – "<label> (#<id>)"                 e.g. "Nickname (#nick)"
 * - validate()      – [] , or ["<label> is required"] when the field is required and the value is ""
 * - fill(input):
 *     disabled => throw new Error("<id> is disabled")   (nothing changes)
 *     otherwise value = normalize(input), fills + 1, and return "fill <id> = <display()>"
 *   new UiField("nick", "Nickname", true).fill("  dana  ") => 'fill nick = "dana"'
 * Note: fill() calls this.normalize() and this.display() – in the next tasks the subclasses change those
 * two, and fill() (written once, here) automatically uses their version.
 */
export class UiField {
  #value = "";
  #fills = 0;
  #disabled = false;

  constructor(
    readonly id: string,
    readonly label: string,
    protected readonly required = false,
  ) {}

  get value(): string {
    throw new Error("TODO");
  }

  get fills(): number {
    throw new Error("TODO");
  }

  get disabled(): boolean {
    throw new Error("TODO");
  }

  disable(): void {
    throw new Error("TODO");
  }

  protected normalize(input: string): string {
    throw new Error("TODO");
  }

  display(): string {
    throw new Error("TODO");
  }

  describe(): string {
    throw new Error("TODO");
  }

  validate(): string[] {
    throw new Error("TODO");
  }

  fill(input: string): string {
    throw new Error("TODO");
  }
}

/**
 * Task 2 – Text fields (inheritance + super)
 * TextField – the constructor is given. normalize: the parent's normalize, cut to maxLength characters.
 *   new TextField("name", "Full name", true, 10).fill("  Dana Levi-Cohen ") => 'fill name = "Dana Levi-"'
 * EmailField extends TextField
 * - normalize: the TextField normalize, in lower case       " Dana@Shop.TEST " => "dana@shop.test"
 * - validate: the parent's errors, plus "<label> is not a valid email" when the value is not "" and has no "@"
 * PasswordField extends TextField
 * - display: "***" (or "(empty)" when there is no value) – a password never appears in a log
 * - describe: the parent's describe + " [secret]"         => "Password (#password) [secret]"
 * - validate: the parent's errors, plus "<label> must be at least 8 characters" when the value is not ""
 *   and shorter than 8
 * Always start from super.normalize() / super.validate() / super.describe() – don't copy the parent's code.
 */
export class TextField extends UiField {
  constructor(
    id: string,
    label: string,
    required = false,
    protected readonly maxLength = 30,
  ) {
    super(id, label, required);
  }

  protected override normalize(input: string): string {
    throw new Error("TODO");
  }
}

export class EmailField extends TextField {
  // TODO: override normalize and validate
}

export class PasswordField extends TextField {
  // TODO: override display, describe and validate
}

/**
 * Task 3 – Checkbox and Dropdown
 * Checkbox extends UiField
 * - normalize: "yes" when the trimmed text, in lower case, is one of "yes" / "true" / "on" / "1" – otherwise "no"
 *     fill("ON") => 'fill terms = "yes"'     fill("nope") => 'fill terms = "no"'
 * - validate: ["<label> must be checked"] when the field is required and the value is not "yes", otherwise []
 *     (it replaces the parent's rule – "no" is not an empty value, but it is not checked either)
 * Dropdown extends UiField – the constructor is given
 * - describe: the parent's describe + " [<the options joined by |>]"     => "Plan (#plan) [free|pro]"
 * - fill(input): if the trimmed text is not one of the options =>
 *     throw new Error('"<text>" is not an option of <id>')   (nothing changes)
 *   otherwise – let the parent do the rest: return super.fill(...)
 */
export class Checkbox extends UiField {
  // TODO: override normalize and validate
}

export class Dropdown extends UiField {
  constructor(
    id: string,
    label: string,
    private readonly options: string[],
    required = false,
  ) {
    super(id, label, required);
  }

  // TODO: override describe and fill
}

/**
 * Task 4 – The Form (encapsulation of a collection)
 * The fields live in the # field #fields – only the Form adds to it.
 * - size (getter) – how many fields
 * - add(field) – adds the field and returns the form itself (return this), so calls can be chained:
 *     new Form("Sign up").add(a).add(b)
 *   throws new Error("Duplicate field id: <id>") if a field with the same id is already there
 * - field(id) – returns the field with this id, or throws new Error("No field with id: <id>")
 * The Form accepts ANY UiField – a TextField, a Checkbox, or a kind of field that doesn't exist yet.
 *
 * Task 5 – fillAll(data)
 * Goes over the fields IN THE ORDER THEY WERE ADDED (not the order of the keys in data):
 * - a field whose id is not a key in data – skip it, no log line
 * - otherwise call fill and add its line to the log
 * - if fill throws (disabled, not an option...) – add "skip <id>: <the error message>" and go on
 * Returns the log lines. Hint: try / catch inside the loop;  "id" in data  tells you if a key exists.
 *
 * Task 6 – errors(), isValid and summary()
 * - errors() – the validate() errors of all the fields, in order, in one flat array (hint: flatMap)
 * - isValid (getter) – true when there are no errors
 * - summary() – the report lines:
 *     "<form name>: <size> fields"
 *     one line per field: "  <describe()> = <display()>"      (two spaces at the start)
 *     "valid"  – or – "<number> errors: <the errors joined by "; ">"
 */
export class Form {
  #fields: UiField[] = [];

  constructor(readonly name: string) {}

  get size(): number {
    throw new Error("TODO");
  }

  add(field: UiField): this {
    throw new Error("TODO");
  }

  field(id: string): UiField {
    throw new Error("TODO");
  }

  fillAll(data: FormData): string[] {
    throw new Error("TODO");
  }

  errors(): string[] {
    throw new Error("TODO");
  }

  get isValid(): boolean {
    throw new Error("TODO");
  }

  summary(): string[] {
    throw new Error("TODO");
  }
}

/**
 * Task 7 (Challenge) – ConfirmPasswordField
 * A "confirm password" field is a PasswordField (always required) that knows the original PasswordField.
 * - constructor(id, label, original: PasswordField) – keep original in a private readonly field,
 *   and call super so the field is required
 * - validate: everything a PasswordField checks, plus "<label> does not match <original label>"
 *   when its value is different from the original's value
 * You don't write display or describe – they are inherited from PasswordField ("***", "[secret]").
 * Note how the Form doesn't change at all – it just calls validate() on another UiField.
 */
export class ConfirmPasswordField extends PasswordField {
  constructor(id: string, label: string, original: PasswordField) {
    super(id, label);
    throw new Error("TODO");
  }
}

// ============================================================
// Self-check – run:  npm run exercise -- 04 hw
// (No need to change the code below this line)
// ============================================================

function buildSignup(): Form {
  const password = new PasswordField("password", "Password", true);
  return new Form("Sign up")
    .add(new TextField("name", "Full name", true, 10))
    .add(new EmailField("email", "Email", true))
    .add(password)
    .add(new ConfirmPasswordField("confirm", "Confirm password", password))
    .add(new Dropdown("plan", "Plan", ["free", "pro", "team"]))
    .add(new Checkbox("terms", "Terms", true));
}

console.log("\n--- Task 1: UiField ---");
try {
  const f = new UiField("nick", "Nickname", true);
  console.log(f.display(), "=> expected:", "(empty)");
  console.log(f.validate(), "=> expected:", ["Nickname is required"]);
  console.log(f.fill("  dana  "), "=> expected:", 'fill nick = "dana"');
  console.log(f.value, f.fills, "=> expected:", "dana", 1);
  console.log(f.validate(), "=> expected:", []);
  console.log(f.describe(), "=> expected:", "Nickname (#nick)");
  f.disable();
  try {
    f.fill("avi");
    console.log("did not throw", "=> expected:", "an error");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log((err as Error).message, "=> expected:", "nick is disabled");
  }
  console.log(f.value, f.fills, "=> expected:", "dana", 1);
  console.log(new UiField("x", "X").validate(), "=> expected:", []);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 2: TextField, EmailField, PasswordField ---");
try {
  const name = new TextField("name", "Full name", true, 10);
  console.log(name.fill("  Dana Levi-Cohen "), "=> expected:", 'fill name = "Dana Levi-"');
  const email = new EmailField("email", "Email");
  console.log(email.fill(" Dana@Shop.TEST "), "=> expected:", 'fill email = "dana@shop.test"');
  email.fill("dana.shop.test");
  console.log(email.validate(), "=> expected:", ["Email is not a valid email"]);
  const pass = new PasswordField("password", "Password", true);
  console.log(pass.validate(), "=> expected:", ["Password is required"]);
  console.log(pass.fill("abc"), "=> expected:", "fill password = ***");
  console.log(pass.validate(), "=> expected:", ["Password must be at least 8 characters"]);
  console.log(pass.describe(), "=> expected:", "Password (#password) [secret]");
  console.log(pass instanceof TextField, "=> expected:", true);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 3: Checkbox, Dropdown ---");
try {
  const terms = new Checkbox("terms", "Terms", true);
  console.log(terms.fill("ON"), "=> expected:", 'fill terms = "yes"');
  console.log(terms.fill("nope"), "=> expected:", 'fill terms = "no"');
  console.log(terms.validate(), "=> expected:", ["Terms must be checked"]);
  const plan = new Dropdown("plan", "Plan", ["free", "pro"]);
  console.log(plan.describe(), "=> expected:", "Plan (#plan) [free|pro]");
  console.log(plan.fill(" pro "), "=> expected:", 'fill plan = "pro"');
  try {
    plan.fill("gold");
    console.log("did not throw", "=> expected:", "an error");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log((err as Error).message, "=> expected:", '"gold" is not an option of plan');
  }
  console.log(plan.value, plan.fills, "=> expected:", "pro", 1);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 4: Form ---");
try {
  const form = buildSignup();
  console.log(form.size, "=> expected:", 6);
  console.log(form.field("plan").describe(), "=> expected:", "Plan (#plan) [free|pro|team]");
  try {
    form.add(new TextField("email", "Another email"));
    console.log("did not throw", "=> expected:", "an error");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log((err as Error).message, "=> expected:", "Duplicate field id: email");
  }
  try {
    form.field("phone");
    console.log("did not throw", "=> expected:", "an error");
  } catch (err) {
    if ((err as Error).message === "TODO") throw err;
    console.log((err as Error).message, "=> expected:", "No field with id: phone");
  }
  console.log(form.size, "=> expected:", 6);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 5: fillAll ---");
try {
  const form = buildSignup();
  form.field("terms").disable();
  console.log(
    form.fillAll({ email: "DANA@shop.test", name: "Dana", plan: "gold", password: "Secret123", terms: "yes" }),
    "=> expected:",
    [
      'fill name = "Dana"',
      'fill email = "dana@shop.test"',
      "fill password = ***",
      'skip plan: "gold" is not an option of plan',
      "skip terms: terms is disabled",
    ],
  );
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 6: errors, isValid, summary ---");
try {
  const form = buildSignup();
  form.fillAll({ name: "Dana", email: "dana", password: "short" });
  console.log(form.isValid, "=> expected:", false);
  console.log(form.errors(), "=> expected:", [
    "Email is not a valid email",
    "Password must be at least 8 characters",
    "Confirm password is required",
    "Confirm password does not match Password",
    "Terms must be checked",
  ]);
  form.fillAll({ email: "dana@shop.test", password: "Secret123", confirm: "Secret123", terms: "1" });
  console.log(form.isValid, "=> expected:", true);
  console.log(form.summary(), "=> expected:", [
    "Sign up: 6 fields",
    '  Full name (#name) = "Dana"',
    '  Email (#email) = "dana@shop.test"',
    "  Password (#password) [secret] = ***",
    "  Confirm password (#confirm) [secret] = ***",
    "  Plan (#plan) [free|pro|team] = (empty)",
    '  Terms (#terms) = "yes"',
    "valid",
  ]);
  const empty = new Form("Empty").add(new UiField("a", "A", true));
  console.log(empty.summary(), "=> expected:", ["Empty: 1 fields", "  A (#a) = (empty)", "1 errors: A is required"]);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}

console.log("\n--- Task 7 (Challenge): ConfirmPasswordField ---");
try {
  const pass = new PasswordField("password", "Password", true);
  const confirm = new ConfirmPasswordField("confirm", "Confirm", pass);
  pass.fill("Secret123");
  confirm.fill("Secret124");
  console.log(confirm.validate(), "=> expected:", ["Confirm does not match Password"]);
  confirm.fill("Secret123");
  console.log(confirm.validate(), "=> expected:", []);
  console.log(confirm.display(), confirm.describe(), "=> expected:", "***", "Confirm (#confirm) [secret]");
  console.log(confirm instanceof PasswordField, "=> expected:", true);
} catch (e) {
  console.log("  ✋", (e as Error).message);
}
