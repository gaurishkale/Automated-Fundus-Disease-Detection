import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BLUE = [37, 99, 235];
const DARK = [15, 23, 42];
const GRAY = [100, 116, 139];
const WHITE = [255, 255, 255];
const LIGHT_BG = [248, 250, 252];

const XAI_DATA = {
  "Diabetic Retinopathy": {
    title: "Microvascular Abnormalities Detected",
    region: "Macular & Vascular Region",
    findings: [
      "Small red lesions (microaneurysms) detected near macula",
      "Localised retinal haemorrhages observed",
      "Abnormal blood vessel branching patterns",
      "Hard exudates near the foveal region",
    ],
    recommendations: [
      "Schedule detailed retinal examination immediately",
      "Monitor blood glucose and HbA1c levels",
      "Begin or review anti-VEGF treatment plan",
      "Consult ophthalmologist within 1 week",
    ],
  },
  Glaucoma: {
    title: "Optic Nerve Structural Changes",
    region: "Optic Disc Area",
    findings: [
      "Enlarged optic disc cup-to-disc ratio",
      "Nerve fibre layer thinning at superior pole",
      "Peripapillary retinal atrophy signs",
      "Asymmetric disc appearance noted",
    ],
    recommendations: [
      "Initiate intraocular pressure-lowering therapy",
      "Schedule visual field testing within 4 weeks",
      "Get regular IOP measurements every 3 months",
      "Advise family members to undergo screening",
    ],
  },
  "Age-related Macular Degeneration (AMD)": {
    title: "Macular Degeneration Patterns",
    region: "Central Macula",
    findings: [
      "Drusen deposits identified in central macula",
      "Retinal pigment epithelium irregularities",
      "Central retinal thinning detected",
      "Subretinal fluid indicators present",
    ],
    recommendations: [
      "Refer to retinal specialist urgently",
      "Consider AREDS2 nutritional supplements",
      "Monitor central vision with Amsler grid daily",
      "Evaluate eligibility for anti-VEGF therapy",
    ],
  },
  Cataract: {
    title: "Lens Opacity Patterns Identified",
    region: "Crystalline Lens Region",
    findings: [
      "Nuclear sclerosis patterns in lens centre",
      "Reduced light transmission detected",
      "Posterior subcapsular opacity markers",
      "Cortical spoke-like opacities visible",
    ],
    recommendations: [
      "Consult ophthalmologist for surgical evaluation",
      "Assess visual acuity impact on daily activities",
      "Wear UV-blocking sunglasses consistently",
      "Schedule cataract surgery if vision significantly impaired",
    ],
  },
  Hypertension: {
    title: "Hypertensive Retinopathy Signs",
    region: "Retinal Vasculature",
    findings: [
      "Arteriovenous nicking at vessel crossings",
      "Generalised arteriolar narrowing",
      "Focal arteriolar constriction detected",
      "Flame-shaped haemorrhages near disc",
    ],
    recommendations: [
      "Urgently manage systemic blood pressure",
      "Reduce sodium intake and adopt DASH diet",
      "Take antihypertensive medications consistently",
      "Schedule cardiology and nephrology follow-up",
    ],
  },
  Myopia: {
    title: "Axial Length & Peripheral Changes",
    region: "Peripheral Retina & Disc",
    findings: [
      "Temporal disc crescent indicative of high myopia",
      "Peripheral retinal thinning observed",
      "Posterior staphyloma features noted",
      "Lattice degeneration risk markers present",
    ],
    recommendations: [
      "Get updated refraction and lens prescription",
      "Spend 2+ hours outdoors daily to slow progression",
      "Follow the 20-20-20 screen-break rule",
      "Consider orthokeratology or atropine therapy",
    ],
  },
  Normal: {
    title: "Healthy Retinal Architecture Confirmed",
    region: "Full Retinal Field",
    findings: [
      "Optic disc margins appear clear and distinct",
      "Blood vessel calibre within normal range",
      "No drusen or exudates detected",
      "Foveal reflex present and uniform",
    ],
    recommendations: [
      "Continue annual comprehensive eye examinations",
      "Maintain a diet rich in omega-3 and leafy greens",
      "Wear UV-protective sunglasses outdoors",
      "Follow screen-break discipline (20-20-20 rule)",
    ],
  },
};

const RISK_INTERPRETATION = {
  Healthy: "The retinal scan shows no signs of disease. Continue annual check-ups to maintain eye health.",
  "Low Risk": "Mild indicators were detected with low confidence. A routine follow-up is recommended within 6 months.",
  "Moderate Risk": "Moderate indicators of the condition are present. Consult an ophthalmologist within 2–4 weeks for further evaluation.",
  "High Risk": "Strong indicators of the condition are present with high confidence. Urgent specialist consultation is recommended within 1 week.",
};

function getRiskLabel(disease, confidence) {
  const name = (disease || "").toLowerCase();
  if (name === "normal" || name === "healthy") return { label: "Healthy", color: [16, 185, 129] };
  if (confidence < 60) return { label: "Low Risk", color: [16, 185, 129] };
  if (confidence < 85) return { label: "Moderate Risk", color: [245, 158, 11] };
  return { label: "High Risk", color: [239, 68, 68] };
}

function drawLine(doc, y, margin, pageWidth) {
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
}

function drawSectionTitle(doc, title, y, margin) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...DARK);
  doc.text(title, margin, y);
  return y + 7;
}

function ensureSpace(doc, y, needed, pageHeight) {
  if (y + needed > pageHeight - 25) {
    doc.addPage();
    return 20;
  }
  return y;
}

function drawBulletList(doc, items, y, margin, pageWidth, pageHeight) {
  const maxW = pageWidth - margin * 2 - 12;
  items.forEach((item, i) => {
    y = ensureSpace(doc, y, 8, pageHeight);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...DARK);
    const lines = doc.splitTextToSize(`${i + 1}.  ${item}`, maxW);
    doc.text(lines, margin + 4, y);
    y += lines.length * 5.5;
  });
  return y;
}

function addFooters(doc, margin, pageWidth, pageHeight, reportId) {
  const total = doc.internal.getNumberOfPages();
  const footerY = pageHeight - 10;
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFillColor(...BLUE);
    doc.rect(0, 0, 3.5, pageHeight, "F");
    doc.setFillColor(...BLUE);
    doc.rect(0, 0, pageWidth, 2.5, "F");
    doc.setDrawColor(220, 225, 232);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(
      `EyeDetect \u00A9 2026  |  SIES Graduate School of Technology  |  AIML Department \u2013 Student Major Project  |  ${reportId}`,
      margin,
      footerY
    );
    doc.text(`Page ${i} of ${total}`, pageWidth - margin, footerY, { align: "right" });
  }
}

export default function generateReport({ disease, confidence, patient, imageDataUrl }) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const reportId = `ED-2026-${String(Date.now()).slice(-6)}`;
  let y = 18;

  doc.setTextColor(225, 232, 240);
  doc.setFontSize(44);
  doc.setFont("helvetica", "bold");
  doc.text("AI Generated Clinical Report", pageWidth / 2, pageHeight / 2, {
    align: "center",
    angle: 42,
  });

  /* ── HEADER ── */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(...BLUE);
  doc.text("EyeDetect", margin + 4, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...GRAY);
  doc.text("AI Diagnostic Report", pageWidth - margin, y + 3, { align: "right" });
  doc.setFontSize(8);
  doc.text("AI-Powered Retinal Screening System", pageWidth - margin, y + 8, { align: "right" });
  doc.setFontSize(7);
  doc.text(`Report ID: ${reportId}`, pageWidth - margin, y + 13, { align: "right" });

  y += 20;
  drawLine(doc, y, margin, pageWidth);
  y += 10;

  /* ── 1. PATIENT INFORMATION ── */
  y = drawSectionTitle(doc, "Patient Information", y, margin);

  const screeningDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  autoTable(doc, {
    startY: y,
    head: [],
    body: [
      ["Full Name", patient.fullName || "N/A"],
      ["Age", patient.age || "N/A"],
      ["Gender", patient.gender || "N/A"],
      ["Location", patient.location || "N/A"],
      ["Phone", patient.phone || "N/A"],
      ["Email", patient.email || "N/A"],
      ["Date of Screening", screeningDate],
    ],
    theme: "plain",
    margin: { left: margin, right: margin },
    styles: { fontSize: 10, cellPadding: 2.5, textColor: DARK },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 45, textColor: GRAY },
    },
  });

  y = doc.lastAutoTable.finalY + 8;
  drawLine(doc, y, margin, pageWidth);
  y += 10;

  /* ── 2. DIAGNOSTIC RESULT ── */
  y = drawSectionTitle(doc, "AI Diagnostic Result", y, margin);

  const risk = getRiskLabel(disease, confidence);

  autoTable(doc, {
    startY: y,
    head: [["Parameter", "Value"]],
    body: [
      ["Predicted Condition", disease],
      ["AI Confidence", `${confidence}%`],
      ["Risk Level", risk.label],
    ],
    margin: { left: margin, right: margin },
    headStyles: { fillColor: BLUE, textColor: WHITE, fontStyle: "bold", fontSize: 10 },
    styles: { fontSize: 10, cellPadding: 3.5 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 55 } },
    didParseCell(data) {
      if (data.section === "body" && data.row.index === 2 && data.column.index === 1) {
        data.cell.styles.textColor = risk.color;
        data.cell.styles.fontStyle = "bold";
      }
      if (data.section === "body" && data.row.index === 0 && data.column.index === 1) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fontSize = 11;
      }
    },
  });

  y = doc.lastAutoTable.finalY + 8;
  drawLine(doc, y, margin, pageWidth);
  y += 10;

  /* ── 3. RETINAL IMAGE ── */
  if (imageDataUrl) {
    y = ensureSpace(doc, y, 85, pageHeight);
    y = drawSectionTitle(doc, "Retinal Image Analyzed", y, margin);
    y += 2;

    const imgW = 130;
    const imgH = 75;
    const imgX = (pageWidth - imgW) / 2;

    doc.setDrawColor(200, 210, 220);
    doc.setLineWidth(0.5);
    doc.roundedRect(imgX - 1, y - 1, imgW + 2, imgH + 2, 2, 2, "S");

    try {
      doc.addImage(imageDataUrl, "JPEG", imgX, y, imgW, imgH);
    } catch {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...GRAY);
      doc.text("(Image could not be embedded)", pageWidth / 2, y + imgH / 2, { align: "center" });
    }

    y += imgH + 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY);
    doc.text("Uploaded fundus image used for AI analysis", pageWidth / 2, y, { align: "center" });

    y += 8;
    drawLine(doc, y, margin, pageWidth);
    y += 10;
  }

  /* ── 4. AI CLINICAL EXPLANATION ── */
  const xai = XAI_DATA[disease] || XAI_DATA.Normal;

  y = ensureSpace(doc, y, 50, pageHeight);
  y = drawSectionTitle(doc, "AI Clinical Explanation", y, margin);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...DARK);
  doc.text(xai.title, margin + 2, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BLUE);
  doc.text("Detected Findings", margin + 2, y);
  y += 6;

  y = drawBulletList(doc, xai.findings, y, margin, pageWidth, pageHeight);
  y += 4;

  y = ensureSpace(doc, y, 14, pageHeight);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...GRAY);
  doc.text("Primary Affected Region:", margin + 2, y);
  doc.setFillColor(235, 245, 255);
  const regionText = xai.region;
  const regionW = doc.getTextWidth(regionText) + 8;
  doc.roundedRect(margin + 52, y - 4, regionW, 6.5, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...BLUE);
  doc.text(regionText, margin + 56, y);
  y += 10;

  y = ensureSpace(doc, y, 30, pageHeight);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(20, 184, 166);
  doc.text("Clinical Recommendations", margin + 2, y);
  y += 6;

  y = drawBulletList(doc, xai.recommendations, y, margin, pageWidth, pageHeight);
  y += 6;

  drawLine(doc, y, margin, pageWidth);
  y += 10;

  /* ── 5. RISK LEVEL INTERPRETATION ── */
  y = ensureSpace(doc, y, 30, pageHeight);
  y = drawSectionTitle(doc, "Risk Level Interpretation", y, margin);

  const interpretation = RISK_INTERPRETATION[risk.label] || "";
  doc.setFillColor(...LIGHT_BG);
  const interpLines = doc.splitTextToSize(interpretation, pageWidth - margin * 2 - 12);
  const interpH = interpLines.length * 5 + 8;
  doc.roundedRect(margin, y, pageWidth - margin * 2, interpH, 2, 2, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text(interpLines, margin + 6, y + 6);
  y += interpH + 8;

  drawLine(doc, y, margin, pageWidth);
  y += 8;

  /* ── 6. DISCLAIMER ── */
  y = ensureSpace(doc, y, 28, pageHeight);
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 22, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text("Disclaimer", margin + 4, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  const disclaimer =
    "This AI-generated report is intended for preliminary screening purposes only and should not replace " +
    "professional medical consultation. Please consult a qualified ophthalmologist for diagnosis and treatment.";
  const dLines = doc.splitTextToSize(disclaimer, pageWidth - margin * 2 - 8);
  doc.text(dLines, margin + 4, y + 12);

  /* ── FOOTERS + SIDE STRIP ON ALL PAGES ── */
  addFooters(doc, margin, pageWidth, pageHeight, reportId);

  const fileName = `EyeDetect_Report_${(patient.fullName || "Patient").replace(/\s+/g, "_")}_${reportId}.pdf`;
  doc.save(fileName);
}
