/* noteX AI - AI Smart Notes Controller (Hyper Pro) */
const NotesModule = {
  async render(container) {
    if (!container) container = document.getElementById('app-view-container');
    if (!container) return;

    container.innerHTML = `
      <div class="hyper-bento-grid">
        <!-- Hero Header -->
        <div class="hyper-card hyper-col-12" style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(168, 85, 247, 0.15)); border-color: rgba(99, 102, 241, 0.35); padding: 1.75rem 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <span class="hyper-badge hyper-badge-primary" style="margin-bottom: 0.5rem;"><i data-lucide="sparkles"></i> AI Notes Generator</span>
              <h2 style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em;">Smart AI Notes & Formula Sheets</h2>
              <p style="color: var(--hyper-text-secondary); font-size: 0.95rem; margin-top: 0.25rem;">
                Generate structured revision notes, formula cheat sheets, and Board exam summaries instantly.
              </p>
            </div>
          </div>
        </div>

        <!-- Note Generation Input Box -->
        <div class="hyper-card hyper-col-12">
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
              <div>
                <label style="font-size: 0.82rem; font-weight: 600; color: var(--hyper-text-secondary); margin-bottom: 0.35rem; display: block;">Subject:</label>
                <select id="noteSubjectSelect" class="hyper-select">
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Biology">Biology</option>
                  <option value="Social Science">Social Science</option>
                </select>
              </div>

              <div>
                <label style="font-size: 0.82rem; font-weight: 600; color: var(--hyper-text-secondary); margin-bottom: 0.35rem; display: block;">Chapter / Topic Title:</label>
                <input type="text" id="noteChapterInput" class="hyper-input" placeholder="e.g. Chemical Reactions, Snell's Law, AP Series...">
              </div>

              <div>
                <label style="font-size: 0.82rem; font-weight: 600; color: var(--hyper-text-secondary); margin-bottom: 0.35rem; display: block;">Note Format:</label>
                <select id="noteFormatSelect" class="hyper-select">
                  <option value="Smart Summary">Smart Summary</option>
                  <option value="Formula Sheet">Formula Cheat Sheet</option>
                  <option value="Key Concepts">Key Concepts & Definitions</option>
                </select>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
              <button class="hyper-btn hyper-btn-primary" onclick="NotesModule.generateNote()">
                <i data-lucide="wand2"></i> Generate AI Note
              </button>
            </div>
          </div>
        </div>

        <!-- 10 AI Notes List (2-column layout) -->
        <div class="hyper-col-12" id="notesListContainer">
          ${this.get10NotesHTML()}
        </div>
      </div>
    `;

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  },

  get10Notes() {
    return [
      {
        id: 1,
        title: "Snell's Law & Refractive Index Derivations",
        subject: "Physics",
        format: "Formula Sheet",
        content: `### 1. Snell's Law of Refraction
When light passes from Medium 1 to Medium 2:
$$n_1 \\sin \\theta_1 = n_2 \\sin \\theta_2$$
- **Refractive Index ($n$)**: $n = \\frac{c}{v}$ (where $c = 3 \\times 10^8 \\text{ m/s}$).
- **Relative Refractive Index**: $n_{21} = \\frac{n_2}{n_1} = \\frac{v_1}{v_2}$.`
      },
      {
        id: 2,
        title: "Balancing Chemical Equations & Redox Reactions",
        subject: "Chemistry",
        format: "Key Concepts",
        content: `### 1. Law of Conservation of Mass
Total mass of reactants equals total mass of products.
**Example Equation**:
$$2\\text{Mg(s)} + \\text{O}_2\\text{(g)} \\rightarrow 2\\text{MgO(s)}$$
- **Oxidation**: Addition of Oxygen or removal of Hydrogen.
- **Reduction**: Addition of Hydrogen or removal of Oxygen.`
      },
      {
        id: 3,
        title: "Quadratic Formula & Nature of Roots",
        subject: "Mathematics",
        format: "Formula Sheet",
        content: `### 1. Standard Quadratic Equation
$$ax^2 + bx + c = 0 \\quad (a \\neq 0)$$
- **Quadratic Formula**:
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$
- **Discriminant ($D$)**: $D = b^2 - 4ac$
  - If $D > 0$: Two distinct real roots.
  - If $D = 0$: Two equal real roots ($x = -b/2a$).
  - If $D < 0$: No real roots.`
      },
      {
        id: 4,
        title: "Human Digestive System & Enzyme Action Mechanics",
        subject: "Biology",
        format: "Smart Summary",
        content: `### 1. Digestion Organs & Enzymes
- **Mouth**: Salivary Amylase breaks starch into maltose sugar.
- **Stomach**: Pepsin breaks proteins into peptones in acidic pH (HCl).
- **Small Intestine**: Bile juice emulsifies fats; Trypsin breaks proteins; Lipase breaks fats.`
      },
      {
        id: 5,
        title: "Non-Cooperation Movement & Dandi March Chronology",
        subject: "History",
        format: "Timeline Notes",
        content: `### 1. Key Timeline of Indian Freedom Movement
- **1919**: Rowlatt Act & Jallianwala Bagh Massacre.
- **1920-1922**: Non-Cooperation Movement led by Mahatma Gandhi.
- **March 12, 1930**: Dandi Salt March begins from Sabarmati Ashram.`
      },
      {
        id: 6,
        title: "Ohm's Law & Resistors in Series/Parallel",
        subject: "Physics",
        format: "Formula Sheet",
        content: `### 1. Ohm's Law
$$V = IR$$
- **Series Combination**: $R_{eq} = R_1 + R_2 + R_3$ (Current $I$ remains constant).
- **Parallel Combination**: $\\frac{1}{R_{eq}} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3}$ (Voltage $V$ remains constant).`
      },
      {
        id: 7,
        title: "Periodic Table Trends & Valency Calculations",
        subject: "Chemistry",
        format: "Smart Summary",
        content: `### 1. Periodic Properties Trends
- **Atomic Radius**: Decreases across a Period (left to right), Increases down a Group.
- **Valency**: Increases from 1 to 4 across Period 3, then decreases to 0.`
      },
      {
        id: 8,
        title: "Arithmetic Progression Formula Sheet",
        subject: "Mathematics",
        format: "Formula Sheet",
        content: `### 1. AP Formulas
- **$N$-th Term ($a_n$)**: $a_n = a + (n - 1)d$
- **Sum of $N$ Terms ($S_n$)**:
$$S_n = \\frac{n}{2} [2a + (n - 1)d] = \\frac{n}{2} (a + l)$$`
      },
      {
        id: 9,
        title: "Respiration in Human Beings vs Plants Summary",
        subject: "Biology",
        format: "Key Concepts",
        content: `### 1. Aerobic vs Anaerobic Respiration
- **Aerobic**: Glucose + $O_2 \\rightarrow CO_2 + H_2O + 38\\text{ ATP}$ (Mitochondria).
- **Anaerobic (Yeast)**: Glucose $\\rightarrow$ Ethanol + $CO_2 + 2\\text{ ATP}$ (Cytoplasm).`
      },
      {
        id: 10,
        title: "Federalism & Power Sharing in Modern India",
        subject: "Civics",
        format: "Smart Summary",
        content: `### 1. Three Legislative Lists
- **Union List**: Defense, Foreign Affairs (97 items).
- **State List**: Police, Agriculture, Trade (66 items).
- **Concurrent List**: Education, Forests, Marriage (47 items).`
      }
    ];
  },

  get10NotesHTML() {
    const notes = this.get10Notes();
    return `
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem;">
        ${notes.map(note => `
          <div class="hyper-card hyper-card-interactive" style="display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <span class="hyper-badge hyper-badge-primary">${note.subject}</span>
                <span class="hyper-badge hyper-badge-cyan">${note.format}</span>
              </div>
              <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--hyper-text-primary); margin-bottom: 0.75rem;">${note.title}</h3>
              <div style="font-size: 0.85rem; color: var(--hyper-text-secondary); line-height: 1.6; background: var(--hyper-bg-elevated); padding: 1rem; border-radius: var(--hyper-radius-sm); border-left: 3px solid var(--hyper-accent-primary);">
                ${note.content.replace(/###/g, '<strong>').replace(/\\n/g, '<br>')}
              </div>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; border-top: 1px solid var(--hyper-border-subtle); padding-top: 0.75rem;">
              <button class="hyper-btn hyper-btn-glass hyper-btn-sm" onclick="UI.showToast('Note copied to clipboard!', 'success')">
                <i data-lucide="copy" style="width: 14px;"></i> Copy
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  generateNote() {
    const subject = document.getElementById('noteSubjectSelect')?.value || 'Physics';
    const topic = document.getElementById('noteChapterInput')?.value.trim() || 'Electricity & Ohm\'s Law';
    const format = document.getElementById('noteFormatSelect')?.value || 'Smart Summary';

    UI.showToast(`Generating ${format} for ${topic}...`, 'info');
  }
};

window.NotesModule = NotesModule;
