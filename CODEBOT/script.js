const roles = [
    { role: "Web Developer", skills: ["html", "css", "javascript", "react", "node"] },
    { role: "Data Analyst", skills: ["python", "sql", "excel", "power bi", "statistics"] },
    { role: "UI/UX Designer", skills: ["figma", "wireframe", "prototype", "ux", "ui"] }
];

let resumeText = "";
let resumeLines = [];
let extractedSkills = [];

async function parseResume() {
    const file = document.getElementById("resumeInput").files[0];
    if (!file) return alert("Please upload a PDF resume");

    const reader = new FileReader();
    reader.onload = async () => {
        const pdf = await pdfjsLib.getDocument(new Uint8Array(reader.result)).promise;

        resumeText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            resumeText += content.items.map(i => i.str).join("\n") + "\n";
        }

        resumeLines = resumeText.split("\n").map(l => l.trim()).filter(Boolean);
        extractDetails();
        matchRoles();
    };

    reader.readAsArrayBuffer(file);
}

function extractDetails() {

    /* NAME */
    let name = "Not Found";
    for (let i = 0; i < Math.min(10, resumeLines.length); i++) {
        const line = resumeLines[i];
        if (line.length > 4 && line.length < 40 && !/@|\d|resume|cv/i.test(line)) {
            name = line;
            break;
        }
    }
    document.getElementById("name").innerText = name;

    /* EMAIL */
    const email = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/);
    document.getElementById("email").innerText = email ? email[0] : "Not Found";

    /* PHONE */
    const phone = resumeText.match(/(\+?\d{1,3}[\s-]?)?(\d[\s-]?){9,12}/);
    document.getElementById("phone").innerText = phone ? phone[0] : "Not Found";

    /* SKILLS */
    extractedSkills = [];
    roles.forEach(r => r.skills.forEach(s => {
        if (resumeText.toLowerCase().includes(s) && !extractedSkills.includes(s)) {
            extractedSkills.push(s);
        }
    }));
    document.getElementById("skills").innerText = extractedSkills.join(", ") || "Not Found";

    /* EDUCATION – REAL FIX */
    let education = "Not Found";
    const eduIndex = resumeLines.findIndex(l => /education|qualification|academic/i.test(l));

    if (eduIndex !== -1) {
        education = resumeLines
            .slice(eduIndex + 1, eduIndex + 5)
            .join(" | ");
    } else {
        const degreeLine = resumeLines.find(l =>
            /b\.?tech|b\.?e|bsc|bca|m\.?tech|msc|degree|engineering|computer science/i.test(l)
        );
        if (degreeLine) education = degreeLine;
    }

    document.getElementById("education").innerText = education;

    /* EXPERIENCE */
    let experience = "Not Found";
    const expIndex = resumeLines.findIndex(l => /experience|internship|project|training/i.test(l));

    if (expIndex !== -1) {
        experience = resumeLines
            .slice(expIndex + 1, expIndex + 4)
            .join(" | ");
    }

    document.getElementById("experience").innerText = experience;
}

function matchRoles() {
    const results = document.getElementById("results");
    results.innerHTML = "";

    roles.forEach(role => {
        const matched = role.skills.filter(s => extractedSkills.includes(s));
        const percent = Math.round((matched.length / role.skills.length) * 100);

        results.innerHTML += `
            <div class="progress-box">
                <strong>${role.role}</strong>
                <div class="progress-bar">
                    <div class="progress" style="width:${percent}%">${percent}%</div>
                </div>
            </div>
        `;
    });
}
