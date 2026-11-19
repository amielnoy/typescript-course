// Lesson 4 – Homework: Form Robot – fields that fill, validate and describe themselves – Solution
// Check yourself: npm run solution -- 04 hw (self-check at the end of the file)

export type FormData = Record<string, string>; // field id -> the text to type

// ---------- Task 1 – UiField: the base class ----------
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
    return this.#value;
  }

  get fills(): number {
    return this.#fills;
  }

  get disabled(): boolean {
    return this.#disabled;
  }

  disable(): void {
    this.#disabled = true;
  }

  protected normalize(input: string): string {
    return input.trim();
  }

  display(): string {
    return this.#value === "" ? "(empty)" : `"${this.#value}"`;
  }

  describe(): string {
    return `${this.label} (#${this.id})`;
  }

  validate(): string[] {
    return this.required && this.#value === "" ? [`${this.label} is required`] : [];
  }

  fill(input: string): string {
    if (this.#disabled) {
      throw new Error(`${this.id} is disabled`);
    }
    this.#value = this.normalize(input);
    this.#fills++;
    return `fill ${this.id} = ${this.display()}`;
  }
}

// ---------- Task 2 – Text fields ----------
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
    return super.normalize(input).slice(0, this.maxLength);
  }
}

export class EmailField extends TextField {
  protected override normalize(input: string): string {
    return super.normalize(input).toLowerCase();
  }

  override validate(): string[] {
    const errors = super.validate();
    if (this.value !== "" && !this.value.includes("@")) {
      errors.push(`${this.label} is not a valid email`);
    }
    return errors;
  }
}

export class PasswordField extends TextField {
  override display(): string {
    return this.value === "" ? "(empty)" : "***";
  }

  override describe(): string {
    return `${super.describe()} [secret]`;
  }

  override validate(): string[] {
    const errors = super.validate();
    if (this.value !== "" && this.value.length < 8) {
      errors.push(`${this.label} must be at least 8 characters`);
    }
    return errors;
  }
}

// ---------- Task 3 – Checkbox and Dropdown ----------
export class Checkbox extends UiField {
  protected override normalize(input: string): string {
    const yes = ["yes", "true", "on", "1"];
    return yes.includes(super.normalize(input).toLowerCase()) ? "yes" : "no";
  }

  override validate(): string[] {
    return this.required && this.value !== "yes" ? [`${this.label} must be checked`] : [];
  }
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

  override describe(): string {
    return `${super.describe()} [${this.options.join("|")}]`;
  }

  override fill(input: string): string {
    const choice = input.trim();
    if (!this.options.includes(choice)) {
      throw new Error(`"${choice}" is not an option of ${this.id}`);
    }
    return super.fill(choice);
  }
}

// ---------- Task 4 – The Form ----------
export class Form {
  #fields: UiField[] = [];

  constructor(readonly name: string) {}

  get size(): number {
    return this.#fields.length;
  }

  add(field: UiField): this {
    if (this.#fields.some((f) => f.id === field.id)) {
      throw new Error(`Duplicate field id: ${field.id}`);
    }
    this.#fields.push(field);
    return this;
  }

  field(id: string): UiField {
    const found = this.#fields.find((f) => f.id === id);
    if (!found) {
      throw new Error(`No field with id: ${id}`);
    }
    return found;
  }

  // ---------- Task 5 – fillAll ----------
  fillAll(data: FormData): string[] {
    const log: string[] = [];
    for (const field of this.#fields) {
      if (!(field.id in data)) continue;
      try {
        log.push(field.fill(data[field.id]));
      } catch (err) {
        log.push(`skip ${field.id}: ${(err as Error).message}`);
      }
    }
    return log;
  }

  // ---------- Task 6 – errors, isValid and summary ----------
  errors(): string[] {
    return this.#fields.flatMap((f) => f.validate());
  }

  get isValid(): boolean {
    return this.errors().length === 0;
  }

  summary(): string[] {
    const errors = this.errors();
    return [
      `${this.name}: ${this.size} fields`,
      ...this.#fields.map((f) => `  ${f.describe()} = ${f.display()}`),
      errors.length === 0 ? "valid" : `${errors.length} errors: ${errors.join("; ")}`,
    ];
  }
}

// ---------- Task 7 (Challenge) – ConfirmPasswordField ----------
export class ConfirmPasswordField extends PasswordField {
  constructor(
    id: string,
    label: string,
    private readonly original: PasswordField,
  ) {
    super(id, label, true);
  }

  override validate(): string[] {
    const errors = super.validate();
    if (this.value !== this.original.value) {
      errors.push(`${this.label} does not match ${this.original.label}`);
    }
    return errors;
  }
}

// ============================================================
// Self-check – run:  npm run solution -- 04 hw
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
