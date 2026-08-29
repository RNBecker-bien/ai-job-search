---
framework_version: 1.4.3
---

# CV Templates and Tailoring Guide

<!-- SETUP: Profile statements and section ordering are personalized by running /setup -->

## Template: LaTeX moderncv (Banking Style)

All CVs use the moderncv LaTeX package with the "banking" style and a custom accent color, hex `#106103` (a dark green), overriding moderncv's `color1`.

**Output file:** `cv/main_<company>_<role>.tex`
**Compile with:** **lualatex** on MiKTeX/TeX Live. pdflatex often fails on modern MiKTeX installs with `fontawesome5` font-expansion errors; lualatex handles the same sources cleanly.
**Master reference:** `cv/main_example.tex` (comprehensive CV with all competencies, experience, and achievements - use as source when building targeted CVs)

### Compile command

```bash
cd cv && lualatex -interaction=nonstopmode main_<company>_<role>.tex
```

Expected output: `Output written on main_<company>_<role>.pdf (2 pages, ...)`. Any page count other than 2 is a failure that must be fixed before presenting to the user.

## Document Structure

```latex
\documentclass[11pt,a4paper,sans]{moderncv}
\moderncvstyle{banking}
\moderncvcolor{blue}

% Override moderncv's color1 (normally set to blue by \moderncvcolor{blue}
% above) to the standard custom accent. This recolors everything that keys
% off color1: name, section headings (via the renewcommands below), bullet
% markers, and other banking-style accents.
\usepackage{xcolor}
\definecolor{color1}{HTML}{106103}

% Force both first and last name AND section headings to render in the
% custom accent color. Default banking on lualatex+MiKTeX leaves these black
% without this override, which looks inconsistent with the rest of the scheme.
\renewcommand*{\firstnamestyle}[1]{{\fontsize{34}{36}\bfseries\upshape\color{color1}#1}}
\renewcommand*{\lastnamestyle}[1]{{\fontsize{34}{36}\bfseries\upshape\color{color1}#1}}
\renewcommand*{\sectionstyle}[1]{{\sectionfont\color{color1}#1}}

\usepackage[utf8]{inputenc}
% moderncv loads hyperref itself in an \AtEndPreamble hook, so \hypersetup
% must go in an \AtEndPreamble of our own: on moderncv < 2.4 a top-level
% \usepackage{hyperref} clashes with the class's own
% \RequirePackage[unicode]{hyperref}. From 2.4.0 the class passes its options
% through \PassOptionsToPackage instead, which is what removes that clash.
\AtEndPreamble{\hypersetup{
    colorlinks=true,
    linkcolor=color1,
    filecolor=magenta,
    urlcolor=color1,
    pdftitle={[YOUR_NAME] - CV},
    % Keep pdfpagemode=UseNone: this block runs after moderncv's own
    % \AtEndPreamble (moderncv.cls sets pdfpagemode there), so a FullScreen
    % value here would win and open every CV in fullscreen presentation mode.
    pdfpagemode=UseNone,
}}
\usepackage[scale=0.77]{geometry}
\usepackage{import}

% Personal data
\name{[FIRST_NAME]}{[LAST_NAME]}
% If you have no address to list, DELETE this whole line. \address{}{}{} fails
% with "There's no line here to end" on every moderncv version.
\address{[YOUR_ADDRESS]}{}{}
\phone[mobile]{[YOUR_PHONE]}
\email{[YOUR_EMAIL]}
\extrainfo{\href{[YOUR_LINKEDIN_URL]}{LinkedIn}, \href{[YOUR_GITHUB_URL]}{GitHub}}

\begin{document}
\makecvtitle

% 1. Profile statement (1-3 sentences, tailored per role)
% 2. Skills section
% 3. Education section
% 4. Professional Experience section
% 5. Selected Publications (if applicable)
% 6. Honors and Awards (if applicable)
% 7. References

\end{document}
```

### Color overrides

The `\definecolor{color1}{HTML}{106103}` line plus the three `\renewcommand*` lines in the preamble are required on lualatex+MiKTeX. Without the `\definecolor` override, `color1` stays whatever `\moderncvcolor{blue}` set it to; without the three `\renewcommand*` overrides, the firstname, lastname, and section headings render in black regardless of `color1`, which looks inconsistent with the rest of the accent scheme (links, bullet markers, contact icons - all of which already key off `color1` and pick up the redefinition automatically). Both names render bold; if you prefer the firstname in regular weight, change the firstnamestyle override from `\bfseries` to `\mdseries`. Don't drop either override - on most modern installs the defaults render visibly wrong. `106103` (dark green) is the standing default accent color for every CV going forward - only change it if the user explicitly asks for a different color for a specific application.

### Spacing inside itemize lists (important)

**Do not place `\vspace{...}` between `\item` entries in an `itemize` list.** Even though the source looks symmetric, this pattern occasionally produces a noticeably oversized gap before a single item: the inter-item `\vspace` creates a paragraph break that interacts unpredictably with the list's internal `\itemsep`, so LaTeX renders one of the gaps wider than the rest. Remove the inter-item `\vspace` and let `itemize` use its native uniform spacing.

```latex
% WRONG - intermittently produces an oversized gap before one bullet
\begin{itemize}
\item \textbf{Foo}: ...
\vspace{1pt}
\item \textbf{Bar}: ...
\vspace{1pt}
\item \textbf{Baz}: ...
\end{itemize}

% RIGHT - uniform spacing using the list's native itemsep
\begin{itemize}
\item \textbf{Foo}: ...
\item \textbf{Bar}: ...
\item \textbf{Baz}: ...
\end{itemize}
```

Two related patterns are fine and should be kept:
- `\vspace{1pt}` immediately after `\section{...}` (between section heading and first item) - this is between the heading and the list, not between list items.
- `\vspace{3pt}` between top-level `\cventry` blocks in Professional Experience or Education - this gives breathing room between roles and renders consistently.

### Section headings must match the CV's language (important)

Section headings such as `\section{Core Competencies}`, `Professional Experience`, `Education`, `Languages`, `Publications`, `Honors and Awards`, `References` (and any others your template defines), plus the `Available upon request.` line under References, are all **literal English text baked into the template** - they do not translate themselves. Whenever the CV language (see `CV language` in the candidate profile) is not English, translate every one of these too, whatever they are, not just the body prose - a CV with a fully localized profile statement and bullets sitting under untouched English section headers reads as sloppy and inconsistent, and it's an easy thing to forget precisely because the prose translation is the obvious, visible part of the job. Worked example for Spanish: `Competencias Clave`, `Experiencia Profesional`, `Educaci\'on`, `Idiomas`, `Publicaciones`, `Distinciones y Premios`, `Referencias`, `Disponibles a solicitud.` The same rule applies for any other target language - check this explicitly during the verification pass.

## Section-by-Section Tailoring

### Profile Statement / Elevator Pitch (Best Practice)
This is the most important section to customize. It appears right after `\makecvtitle`.

Write 5-7 lines that function as an "elevator pitch": a concise, compelling introduction explaining why you're qualified for *this specific role*. Focus on what the employer gains from hiring you.

When the role sits outside your home domain, **lead with the domain-transfer argument** - the one or two sentences connecting your background to their problem (e.g. wave physics to radar signal processing) belong in the profile statement's opening, not buried in the cover letter. It is the strongest card a domain-changer holds; play it first.

**Create 2-3 profile statement templates for your main role types:**

<!-- SETUP: These are populated based on your background -->
**For [YOUR_PRIMARY_ROLE_TYPE] roles:**
> [YOUR_PROFILE_STATEMENT_TEMPLATE_1]

**For [YOUR_SECONDARY_ROLE_TYPE] roles:**
> [YOUR_PROFILE_STATEMENT_TEMPLATE_2]

**For fluidic/instrumentation engineering roles** *[Used for: illumina_engineer_1_fluidic_systems]*:
> Bioengineering graduate (Jun 2026) with hands-on experience in fluidic systems design, microfluidic device modeling, and instrumentation development. Designed and implemented a tri-gas flow control system using solenoid valves and closed-loop feedback control, performed multi-sensor calibration, and executed systematic failure analysis including sensor drift correction, thermal fault mitigation, and leak integrity testing. Modeled microfluidic and physiological fluid flow using COMSOL Multiphysics across parametric studies comparing diseased and healthy flow conditions. Proficient in Python, MATLAB, and JMP for experimental data analysis and visualization.

**For quality engineering roles** *[Used for: appliedmedical_quality_engineer_1]*:
> Bioengineering graduate with hands-on experience in root cause analysis, failure investigation, statistical analysis, and protocol execution across hardware systems and analytical laboratory environments. Diagnosed and resolved multiple hardware failures through systematic investigation, corrective action implementation, and documented verification of corrections. Proficient in JMP, Python, and MATLAB for statistical data analysis and reporting. Experienced in maintaining accurate documentation of methods, deviations, and results in both research and engineering contexts.

**For molecular biology / diagnostics research associate roles** *[Used for: billiontoone_research_associate]*:
> Bioengineering graduate (June 2026) with hands-on laboratory research experience in molecular biology techniques including PCR, gel electrophoresis, and DNA purification, alongside recombinant protein expression and biomolecular characterization. Contributed to an open-source Python image analysis framework for over a year, building validated detection pipelines and applying quantitative statistical analysis to high-throughput image datasets. Experienced in maintaining accurate experimental records, documenting procedural deviations, and presenting findings to research teams. Manuscript in preparation from undergraduate research.

**For quality control specialist roles** *[Used for: biorad_quality_control_specialist]*:
> Bioengineering graduate (June 2026) with hands-on experience in quality control testing, analytical technique execution, and systematic root cause analysis. Performed gel electrophoresis, SDS-PAGE, Bradford assay quantification, and pH meter calibration across structured laboratory coursework with documented deviation tracking and data integrity practices. Resolved hardware failures through root cause investigation and corrective action implementation. Proficient in Python, MATLAB, and JMP for data analysis and reporting. Committed to Good Laboratory Practices and accurate batch documentation.

**For analytical / process analytics research associate roles** *[Used for: biomarin_research_associate_process_analytics_services]*:
> Bioengineering graduate (June 2026) with hands-on experience in analytical method execution, protein characterization, and GMP/GLP-aligned laboratory documentation. Performed UV/Vis spectrophotometric quantification, SDS-PAGE purity assessment, gel electrophoresis, FRET fluorescence spectroscopy, and affinity chromatography purification in a structured biotechnology laboratory setting. Calibrated analytical instruments against certified reference standards with documented acceptance criteria. Proficient in Python, MATLAB, and JMP for data analysis and reporting. Committed to data integrity, traceability, and accurate electronic record keeping.

**For protein production / lab automation research associate roles** *[Used for: bighat_research_associate_cfps]*:
> Bioengineering graduate (UC Riverside, June 2026) with hands-on experience in recombinant protein expression and purification, molecular biology techniques, and high-throughput laboratory automation. Built and validated computer vision pipelines processing hundreds of images across an automated microbial phenotyping workflow, work that translates directly to reagent QC and process consistency on a high-throughput platform. Organized, detail-oriented, and present research progress regularly to faculty mentors and peers.

**For AI-forward bench science roles** *[Used for: anthropic_research_associate_biology]*:
> Bioengineering graduate (June 2026) with hands-on experience in molecular biology and biochemistry including PCR, gel electrophoresis, plasmid preparation, bacterial cell culture, nucleic acid purification, recombinant protein expression and affinity purification, and quantitative fluorescence and absorbance-based assays. Contributed to an open-source Python image analysis framework for over a year, building validated detection pipelines and applying bioinformatics workflows including sequence alignment, FASTQ analysis, and variant identification. Manuscript in preparation from undergraduate research.
> Note: the archived draft for this role also claimed regular use of "Claude" and "GitHub Copilot" as tools, tailored to a posting that explicitly asked for AI-tool enthusiasm. That claim is role-specific targeting, not a verified general profile fact - do not carry it into other CVs without checking it's true for that application at the time.

**For device / implant design engineer roles** *[Used for: stryker_design_engineer_customized_implants]*:
> Bioengineering graduate (UC Riverside, June 2026) with hands-on experience translating anatomical and physiological data into validated 3D models. Built parametric 3D simulations in COMSOL Multiphysics across microfluidic and physiological geometries, and co-designed and iteratively prototyped a mechanical hardware system through multiple design revisions. Combines this 3D design foundation with direct experience evaluating and segmenting biomedical image data, coursework in biomechanics, biomaterials, and tissue engineering, and a track record of cross-functional collaboration with graduate researchers and faculty.

**For computational biology / imaging-and-ML roles** *[Used for: axiombio_computational_scientist_biology]*:
> Bioengineering graduate (UC Riverside, June 2026) with over a year of hands-on experience building computer vision pipelines for high-throughput microbial phenotyping, directly relevant to high-content imaging analysis and morphology profiling. Built and validated image-based phenotype detection pipelines (Python, OpenCV, scikit-image, ImageJ) against a 200+ image ground-truth dataset, improving colony detection accuracy by approximately 40% over SGATools and Iris through systematic parameter optimization and benchmarking. Applies clustering, regression, and multivariate statistical analysis to extract biological signal from noisy, high-dimensional datasets, and is currently extending this pipeline with LLM-assisted parameter optimization to automate image-processing workflow configuration. Combines this computational foundation with wet-lab molecular biology experience and hands-on physiological fluid-flow modeling of hepatic and other organ systems to bridge experimental design and computational analysis of human biology.
> Note: "graduate" phrasing corrected here from the archived draft's "student, degree expected June 2026" - at the time that CV was drafted, the profile still described graduation as pending; the official transcript later confirmed the degree was conferred June 12, 2026.

**For lab automation / controls engineering roles** *[Used for: natera_laboratory_automation_engineer]*:
> Bioengineering graduate (UC Riverside, June 2026) with hands-on experience building embedded automation systems and computer vision pipelines for high-throughput laboratory workflows. Co-designed a mammalian cell culture incubator with closed-loop temperature, tri-gas, and lighting control on dual Arduino microcontrollers, then diagnosed and resolved sensor drift, thermal-runaway risk, and a chamber leak through systematic root-cause troubleshooting. Built and validated Python-based image analysis pipelines automating colony detection across a 200+ image dataset, improving accuracy by approximately 40% through parameter optimization and benchmarking against existing tools. Applies Good Laboratory Practice standards to instrument calibration and documentation, and collaborates closely with faculty mentors and fellow researchers on engineering projects.
> Note: same graduation-status correction as above applied to this template.

**For process/analytical research scientist roles** *[Used for: freseniuskabi_associate_research_scientist]*:
> Bioengineering graduate (UC Riverside, June 2026) with hands-on laboratory and instrumentation experience spanning recombinant protein expression and purification, quantitative assay characterization, and mammalian cell-culture hardware design and troubleshooting. Built and validated computer vision pipelines to generate structured, quantitative data from biological imaging, improving detection accuracy by approximately 40% through systematic optimization and benchmarking. Applies Good Laboratory Practice principles and statistical analysis methods to keep experimental data traceable and reproducible, and collaborates closely with faculty mentors and graduate researchers on shared laboratory projects.

**For industrial/analytical lab technician roles** *[Used for: honeywell_rd_tech_ii]*:
> Bioengineering graduate (UC Riverside, June 2026) with hands-on experience in analytical instrument calibration, laboratory testing, and data quality verification under Good Laboratory Practice standards. Calibrated and maintained UV-Vis spectrometers, pH meters, and volumetric equipment, and applied statistical quality control and outlier analysis to evaluate experimental data integrity. Brings a background in chromatography-based purification and quantitative laboratory data analysis (Python, MATLAB, JMP), and a demonstrated pattern of learning new lab instrumentation and analytical procedures quickly and accurately.

**For genomics platform research associate roles** *[Used for: bionano_research_associate]*:
> Bioengineering graduate (UC Riverside, June 2026) with hands-on experience in wet-lab molecular biology (DNA purification, gel electrophoresis, PCR) and quantitative data analysis that transfers directly to DNA sample generation and throughput-optimization work. Contributed to bioinformatics workflows including sequence alignment, FASTQ analysis, and variant identification from Sanger sequencing data. Built and validated computer vision pipelines that improved detection accuracy by approximately 40% through systematic parameter optimization and benchmarking, demonstrating the same iterative, data-driven approach genomics platform development depends on.

**For clinical/surgical robotics engineering roles** *[Used for: jnj_clinical_engineer]*:
> Bioengineering graduate (UC Riverside, June 2026) with hands-on experience spanning robotics, embedded control systems, and the full define-design-build-test-validate cycle for personal and academic hardware projects. Built and programmed an autonomous robot (Raspberry Pi, Python) implementing navigation and sensing algorithms, and designed a closed-loop embedded control system for a mammalian cell culture platform, then diagnosed and resolved multiple hardware failures through systematic root-cause investigation before returning the system to service. Proficient in Python and MATLAB for statistical analysis and system validation, with biomedical engineering coursework spanning biomechanics, tissue engineering, and medical diagnostics.

**For instrument control software engineering roles** *[Used for: aurekabio_control_software_engineer]*:
> Bioengineering graduate (UC Riverside, June 2026) with hands-on experience developing embedded control software for integrated hardware and software systems. Designed and implemented closed-loop control software on dual Arduino microcontrollers to regulate temperature, tri-gas flow through solenoid valves, and lighting for a mammalian cell culture platform, then diagnosed and resolved sensor drift, thermal-runaway risk, and a chamber leak through systematic root-cause investigation. Builds Python-based data analysis and computer vision pipelines to validate system performance and troubleshoot hardware behavior.

**For AI-native biotech research associate roles** *[Used for: cytohub_research_associate]*:
> Bioengineering graduate (UC Riverside, June 2026) with hands-on experience building computer vision pipelines that turn raw imaging data into structured, validated datasets, directly relevant to feeding an AI-native data platform. Constructed a 200+ image ground-truth segmentation dataset and improved automated detection accuracy by approximately 40% through parameter optimization and benchmarking. Combines this imaging and data-pipeline background with molecular biology bench experience and Good Laboratory Practice documentation discipline.

**For medical device algorithm QC roles** *[Used for: collabera_engineer]*:
> Bioengineering graduate (UC Riverside, June 2026) with over a year of hands-on experience building computer vision pipelines for cell detection and region segmentation, directly relevant to quality control algorithm work in medical device imaging. Built and validated image-based detection pipelines against a 200+ image ground-truth dataset, improving detection accuracy by approximately 40% over existing tools through systematic parameter optimization and benchmarking, the same research-evaluate-optimize cycle applied to hematology algorithm QC. Proficient in MATLAB, Python, and statistical analysis.

**For design quality / design verification engineering roles** *[Used for: abbott_associate_design_quality_engineer]*:
> Bioengineering graduate (UC Riverside, June 2026) with hands-on experience in design verification testing, root-cause failure analysis, and data-driven specification development for hardware systems. Co-designed and iteratively prototyped a mammalian cell culture incubator, then ran systematic design verification testing that diagnosed sensor drift, a thermal-runaway risk, and a chamber leak, implementing and verifying corrective fixes for each. Applies statistical quality control and Tukey outlier analysis to evaluate experimental data integrity and determine appropriate limits, and builds MATLAB and Python tools to compile and evaluate test data. Combines this design-verification and quality-data foundation with coursework in biomechanics, biomaterials, and tissue engineering, and a track record of presenting technical findings across cross-functional teams.

**For wet-lab research associate roles (diagnostics/reagents)** *[Used for: biorad_research_associate_i]*:
> Bioengineering graduate (UC Riverside, June 2026) with hands-on laboratory experience executing wet-lab molecular biology and biochemistry techniques, including PCR, cell culture, DNA purification, gel electrophoresis, chromatography, and protein purification, performed under structured experimental protocols with disciplined documentation and troubleshooting. Maintains detailed experimental records and applies systematic root-cause troubleshooting, demonstrated across both bench-science coursework and a hardware-diagnostics capstone project. Contributing LLM-assisted parameter optimization, using Claude Code, to automate image-processing workflow configuration, work directly transferable to AI-assisted data organization and anomaly flagging. Proficient in Python, MATLAB, and JMP for quantitative data analysis and reporting.

**For product development / analytical characterization roles** *[Used for: catalent_associate_scientist_product_development]*:
> Bioengineering graduate (UC Riverside, June 2026) with hands-on experience in analytical instrumentation, quantitative assay characterization, and Good Laboratory Practice-aligned documentation, alongside coursework applying transport-phenomena modeling to drug delivery. Calibrated UV-Vis spectrometers, pH meters, and volumetric equipment under GLP standards, and characterized recombinant proteins via SDS-PAGE, Bradford assay, and FRET spectroscopy following chromatographic purification. Modeled species transport and diffusion gradients in a two-inlet microfluidic device using COMSOL Multiphysics, investigating drug delivery limitations in poorly perfused tumor microenvironments, coursework that builds a foundation in the transport-phenomena reasoning underlying drug delivery challenges. Brings a demonstrated pattern of quickly learning new laboratory instrumentation and analytical techniques, built through hands-on coursework spanning analytical chemistry, transport modeling, and molecular biology. Proficient in Python, MATLAB, and JMP for quantitative data analysis and reporting.

**For technical applications / sequencing-adjacent scientist roles** *[Used for: elementbiosciences_technical_applications_scientist]*:
> Bioengineering graduate (UC Riverside, June 2026) with hands-on experience in molecular biology, bioinformatics, and instrumentation spanning fluidics, sensors, and electromechanical systems. Built and validated Python-based computer vision pipelines processing hundreds of high-resolution images, applying systematic troubleshooting and statistical analysis to resolve data-quality issues at the source. Performed PCR, gel electrophoresis, and Sanger-sequencing-based bioinformatics workflows including sequence alignment and variant identification. Communicates clearly with faculty mentors and peers, presenting technical findings and troubleshooting steps regularly.

**For field/laboratory service engineering roles** *[Used for: lamresearch_laboratory_service_engineer_1]*:
> Bioengineering graduate (UC Riverside, June 2026) with hands-on experience diagnosing, repairing, and calibrating embedded hardware and instrumentation systems, from initial fault through verified corrective fix. Co-designed a mammalian cell culture incubator with tri-gas flow regulation and closed-loop temperature control on dual Arduino microcontrollers, then systematically diagnosed and resolved a sensor drift event, a thermal-runaway risk, and a chamber leak before returning the system to service. Builds Python and MATLAB tools to evaluate system performance and collaborates closely with faculty mentors and peers through iterative hardware design reviews.

**For bioinformatics / computational pipeline roles** *[Used for: massgeneralbrigham_bioinformatician_i]*:
> Bioengineering graduate (UC Riverside, June 2026) with nearly two years of hands-on experience building open-source bioinformatics and computer vision pipelines for high-throughput biological data analysis. Built and validated Python-based detection pipelines for Phenotypic, an open-source microbial phenotyping framework, against a 200+ image ground-truth dataset, improving detection accuracy by approximately 40% through systematic parameter optimization and benchmarking against existing tools. Applies sequence alignment, FASTQ analysis, and variant identification alongside clustering, regression, and multivariate statistical analysis to extract signal from biological datasets. Proficient in Python, MATLAB, and JMP, and is extending the Phenotypic pipeline with LLM-assisted parameter optimization to automate workflow configuration.

**For medical device R&D engineering roles (implantables/interventional)** *[Used for: medtronic_rd_engineer_i]*:
> Bioengineering graduate (UC Riverside, June 2026) with hands-on experience in design verification testing and systematic root-cause investigation of hardware systems, from initial concept through diagnosed failure to verified corrective fix. Co-designed and iteratively prototyped a mammalian cell culture incubator through a full design-build-verify cycle, applying the same systematic diagnose-then-correct discipline released products depend on, detailed under Professional Experience below. Coursework in biomechanics, biomaterials, and tissue engineering provides a grounding relevant to implantable device development. Builds Python and MATLAB tools to evaluate system performance and collaborates closely with faculty mentors and peers through iterative design reviews.

**For in vitro assay / immunology-adjacent associate scientist roles** *[Used for: mindlance_associate_scientist]*:
> Bioengineering graduate (UC Riverside, June 2026) with hands-on laboratory experience in cell culture, quantitative in vitro assay development, and molecular biology technique execution, alongside coursework in immunology and clinical hematology. Performed recombinant protein expression, affinity purification, and Bradford assay and FRET spectroscopy-based quantification in a structured biotechnology laboratory setting, applying the same assay-development and quantitative-analysis discipline in vitro immune assay work depends on. Has not yet worked with flow cytometry specifically, but brings a demonstrated pattern of learning new laboratory instrumentation and analytical techniques quickly. Proficient in Python, MATLAB, and JMP for experimental data analysis and reporting.

**For materials engineering / hardware troubleshooting roles** *[Used for: neuralink_rd_materials_engineer_intern]*:
> Bioengineering graduate (UC Riverside, June 2026) with hands-on experience in materials handling, chemical characterization, and hardware/materials troubleshooting across laboratory and embedded-systems projects. Co-designed and iteratively prototyped a mammalian cell culture incubator, diagnosing and resolving a CO$_2$ sensor drift event, a TEC thermal-runaway risk, and a chamber leak through systematic materials- and hardware-level root-cause investigation. Performed recombinant protein expression, Ni-NTA affinity chromatography purification, and SDS-PAGE/Bradford characterization, alongside COMSOL-based species-transport modeling of microfluidic devices. Calibrated analytical instruments (UV-Vis spectrometers, pH meters, volumetric equipment) under Good Laboratory Practice standards, applying statistical quality control and outlier analysis in JMP and Minitab to verify data integrity.

**For embedded firmware / electro-mechanical prototyping roles** *[Used for: penumbra_rd_engineer_ii]*:
> Bioengineering graduate (UC Riverside, June 2026) with hands-on experience developing embedded firmware and prototyping electro-mechanical hardware from concept through verified working system. Designed and implemented closed-loop control software (Arduino, C) regulating temperature, tri-gas flow through solenoid valves, and lighting for a mammalian cell culture platform, then diagnosed and resolved sensor drift, thermal-runaway risk, and a chamber leak through systematic root-cause investigation, applying PWM power limiting as a corrective control strategy. Also assembled and programmed an autonomous robot (Raspberry Pi, Python) implementing navigation and sensing algorithms. Builds Python-based data analysis tools to validate system performance and thrives in fast-paced, iterative, cross-functional environments.

**For instrumentation / acoustics-adjacent R&D engineering roles** *[Used for: petalsurgical_associate_rd_engineer_acoustics_therapy]*:
> Bioengineering graduate (UC Riverside, June 2026) with hands-on experience in electrical/bioinstrumentation measurement, experimental test-rig design, and rigorous documentation across coursework and independent hardware projects. Operated oscilloscopes, function generators, and an AD620 instrumentation amplifier to characterize analog filter circuits and acquire biosignals, and co-designed and iteratively prototyped a mammalian cell culture incubator from concept through calibrated, verified operation. Wrote MATLAB and Python scripts for data processing, plotting, and statistical analysis, and maintained Good Laboratory Practice-aligned documentation and calibration logs across multiple laboratory courses.

**For process engineering roles** *[Used for: sanmina_junior_process_engineer]*:
> Bioengineering graduate (UC Riverside, June 2026) with hands-on experience in root cause analysis, failure investigation, statistical data analysis, and iterative hardware design across embedded systems and analytical laboratory environments. Diagnosed and resolved multiple hardware failures on an embedded control system through systematic investigation, corrective action implementation, and verified results. Proficient in Python, MATLAB, and JMP for statistical analysis and outlier detection. Experienced in maintaining accurate documentation of methods, deviations, and results in both engineering and research contexts.

**For bioprocess / cell-culture-adjacent associate scientist roles** *[Used for: thefountaingroup_associate_scientist_i]*:
> Bioengineering graduate (UC Riverside, June 2026) with hands-on laboratory experience in aseptic cell culture technique, molecular biology, and quantitative biochemical assay work, alongside a bioprocess-relevant background in closed-system environmental control. Performed bacterial cell culture, plasmid transformation, and recombinant protein expression and purification under structured aseptic protocols, the same sterile-technique discipline that bioreactor feeding and sampling depend on. Co-designed a mammalian cell culture incubator with programmable temperature and tri-gas (CO$_2$, O$_2$, N$_2$) regulation, an instrumentation project that built direct working knowledge of the environmental variables (gas content, temperature) that govern cell growth. Has not yet worked with CHO cell lines or bioreactor platforms specifically, but brings a demonstrated pattern of learning new laboratory instrumentation quickly. Proficient in Python and JMP for statistical analysis and experimental design.

**For biomedical equipment technician roles** *[Used for: cedarssinai_biomedical_technician_genomics_core]*:
> Bioengineering graduate (UC Riverside, June 2026) with hands-on experience in biomedical equipment calibration, maintenance, and troubleshooting, alongside molecular biology laboratory technique and DNA/RNA quantification. Co-designed and maintained a mammalian cell culture incubator, diagnosing and resolving sensor drift, thermal-runaway, and leak failure modes through systematic root-cause troubleshooting and preventive maintenance. Performed PCR, gel electrophoresis, and Nanodrop-based nucleic acid quantification, and verified recombinant protein purity via SDS-PAGE, Bradford assay, and FRET-based fluorescent quantification. Calibrated analytical laboratory instruments (UV-Vis spectrometers, pH meters, volumetric equipment) under Good Laboratory Practice standards, applying statistical quality control to verify data integrity, while concurrently balancing an ongoing research role, coursework labs, and a capstone hardware build.

**For early-phase R&D prototyping roles (biomedical hardware)** *[Used for: imperativecare_rd_engineer_i]*:
> Bioengineering graduate (UC Riverside, June 2026) with hands-on experience in early-phase design, prototyping, and design verification testing of hardware systems for controlled biomedical environments. Co-designed and iteratively prototyped a mammalian cell culture incubator with programmable temperature, tri-gas, and light-stimulation control, executing systematic design verification testing, diagnosing and correcting failures including sensor drift and a thermal-runaway risk, and building Python and MATLAB tools to evaluate system performance. Combines this direct prototyping and DV testing experience with COMSOL Multiphysics-based device and fluid-transport modeling and Good Laboratory Practice-aligned instrument calibration, and collaborates closely with faculty mentors and peers through iterative design cycles.

**For industrial automation / controls engineering roles** *[Used for: paciv_entry_level_automation_controls_engineer]*:
> Bioengineering graduate (UC Riverside, June 2026) with hands-on experience designing embedded control systems and computer vision pipelines for automated hardware. Co-designed a closed-loop cell culture incubator with tri-gas regulation and PWM motor/TEC control on dual Arduino microcontrollers, and separately built and validated Python-based computer vision pipelines that improved automated detection accuracy by approximately 40% through systematic parameter optimization and benchmarking. Comfortable reading and interpreting electrical schematics and wiring diagrams, and collaborates closely with faculty mentors and peers through iterative hardware design reviews.

**For lab automation / instrumentation troubleshooting roles (biotech)** *[Used for: terraytx_associate_laboratory_automation_engineer]*:
> Bioengineering graduate (UC Riverside, June 2026) with hands-on experience troubleshooting automated hardware and software systems across sensor, actuator, and fluidics control loops. Diagnosed and resolved a CO$_2$ sensor drift event and a thermal-runaway risk in a TEC power system, and located and verified the fix for a chamber leak, on an environmentally controlled instrument, restoring it to service through systematic root-cause investigation. Builds Python- and ImageJ-based computer vision pipelines that turn raw imaging data into structured, validated datasets for high-throughput biological workflows.

**For mechanical/biomedical hardware test engineering roles** *[Used for: currentsurgical_bme_me_rd_test_engineer]*:
> Bioengineering graduate (UC Riverside, June 2026) with hands-on experience spanning microfluidics, precision instrumentation, and ultrasound-based measurement, directly aligned with the electronics, microfluidics, and acoustic physics a clinical prototype depends on. Designed a two-inlet microfluidic device and modeled species transport in COMSOL Multiphysics to investigate drug delivery limitations in poorly perfused tumor microenvironments. Operated oscilloscopes, function generators, and ultrasound transducers for time-of-flight measurement, and designed an AD620 instrumentation amplifier circuit to acquire biosignals. Co-designed and iteratively prototyped a mammalian cell culture incubator with embedded sensor and actuator integration, diagnosing and resolving multiple hardware failure modes through systematic root-cause troubleshooting. Writes MATLAB and Python tools for experimental data processing and statistical analysis.

**For systems verification / compliance-testing engineering roles** *[Used for: cytekbiosciences_systems_verification_engineer_i]*:
> Bioengineering graduate (UC Riverside, June 2026) with hands-on experience in electrical/bioinstrumentation measurement, design verification testing, and statistical data analysis for compliance-oriented laboratory environments. Executed systematic design verification testing on a mammalian cell culture incubator, diagnosing and correcting three independent hardware failure modes with documented, verified fixes, and operated oscilloscopes, function generators, and an AD620 instrumentation amplifier to characterize analog filter circuits and acquire biosignals. Applies JMP-based statistical quality control (Grubbs outlier testing, RSD) and Good Laboratory Practice-aligned documentation across cross-disciplinary electrical, mechanical, and software engineering work.

**For product-development R&D engineering roles (design verification & DHF documentation)** *[Used for: stryker_rd_engineer]*:
> Bioengineering graduate (UC Riverside, June 2026) with hands-on experience across the full concept-to-verified-fix product development cycle: mechanical prototyping, bench testing, and systematic root-cause investigation of hardware systems. Co-designed and iteratively prototyped a mammalian cell culture incubator, running design verification testing that diagnosed and corrected a sensor drift event and a thermal-runaway risk, and verified the fix for a chamber leak, and contributed directly to the project's Design History File, including the scope and objectives, target specification table, design matrix/house of quality, prototype documentation, data validation, and bill of materials. Applies statistical analysis (MATLAB, Python, JMP, Minitab) to evaluate test data, grounded in coursework spanning biomechanics, biomaterials, and tissue engineering. Ramps quickly on new CAD platforms, having independently learned COMSOL Multiphysics for parametric modeling, and collaborates readily across cross-functional teams.

**For early-career electrical/embedded-hardware engineering roles (defense sector)** *[Used for: anduril_early_career_electrical_engineer]*:
> Bioengineering graduate (UC Riverside, June 2026) with hands-on experience designing, integrating, and troubleshooting embedded electrical hardware from concept through verified functional prototype. Operated oscilloscopes, function generators, and an AD620 instrumentation amplifier to characterize analog circuits and acquire biosignals, and developed embedded C/C++ firmware on dual Arduino Mega microcontrollers integrating multiple sensors over UART and I2C. Diagnosed three independent hardware failure modes (sensor drift, thermal-runaway risk, a chamber leak) through systematic root-cause investigation, correcting the sensor-drift and thermal-runaway issues and verifying the chamber-leak fix before return to service, spanning the electrical/software boundary with Python- and MATLAB-based diagnostic tooling. Comfortable reading and applying circuit schematics, uses Git/GitHub for version control, and regularly coordinates across electrical, software, and mechanical work with graduate researchers and faculty mentors.

**For embedded firmware engineering roles (defense sector)** *[Used for: anduril_early_career_firmware_engineer]*:
> Bioengineering graduate (UC Riverside, June 2026) with hands-on experience developing low-level embedded firmware in C, integrating sensors over multiple bus protocols, and debugging across the electrical/firmware boundary. Developed closed-loop embedded firmware on dual Arduino Mega microcontrollers, integrating a CO$_2$ sensor and a temperature/humidity sensor over UART and an O$_2$ sensor over I2C, and diagnosed three independent hardware failure modes (sensor drift, thermal-runaway risk, a chamber leak) through systematic root-cause investigation spanning sensor, actuator, and firmware layers. Operated oscilloscopes and function generators for circuit-level debugging, and regularly coordinates across electrical, firmware, and mechanical work with graduate researchers and faculty mentors.

**For systems integration / sequencing-platform engineering roles** *[Used for: illumina_systems_integration_engineer_1]*:
> Bioengineering graduate (UC Riverside, June 2026) who traces system-level issues to root cause and verifies the fix against specification, applied across wet-lab molecular biology, hardware design verification testing, and bioinformatics analysis of sequencing data. Co-designed and iteratively prototyped a mammalian cell culture incubator, executing systematic design verification testing that diagnosed a CO$_2$ sensor drift event and a chamber leak, identified and mitigated a TEC thermal-runaway risk before failure, and verified each corrective fix against specification. Performed PCR, gel electrophoresis, recombinant protein expression, and Ni-NTA affinity chromatography purification, and validated DNA sequence data through Sanger sequencing chromatogram analysis and mutation identification. Builds Python and MATLAB tools to analyze experimental and system-level data, and documents procedures, deviations, and results to Good Laboratory Practice standards.

Statements labeled *[Used for: <company>_<role>]* were extracted from archived application drafts by `/setup` Path A. They are **phrasing references, never fact sources**: when drafting from one, every factual claim still comes from `01-candidate-profile.md` - a past tailored draft does not vouch for its own accuracy. Numbers or specifics that appeared in an archived draft but are not grounded in `01-candidate-profile.md` (e.g., dataset-size figures that drifted between drafts) have been dropped from these templates - only the framing language was kept.

### Core Competencies / Skills Section (Best Practice)
Reorder and emphasize based on the role. Use bold category labels.

List **5-7 key competencies** in bullet format, tailored to the specific job. For each competency, briefly explain how it adds value to the position.

Use the posting's own core term in the matching bullet's bold label when it truthfully applies - ATS and skim-reading hiring managers match literally, and "MLOps" in a heading outperforms a paraphrase like "ML Deployment".

### Education
- Always include your highest degrees
- For senior roles, keep education brief (dates and titles only)
- Include thesis topics when relevant to the target role

#### In-progress qualifications must say so explicitly

**A bare year range is not enough.** An entry reading `2025–2026`, seen partway through 2026, looks like a *finished* degree, because a reader skimming a CV treats a closed range as closed. A profile statement that says "currently completing…" does not fix it: the education entry is where a reader checks the credential, so it has to stand on its own.

State completion inside the entry itself:

```latex
\item{\cventry{2025--2026}{[Degree], [Field]}{[Institution]}{[Location]}{}{\vspace{1pt}
In progress, expected [Month Year]. [Relevant topics]
}}
```

Any consistent form works: `In progress, expected <Month Year>.` / `Expected completion <Month Year>.` / a date field of `2025–present`.

Claiming a credential not yet held is a factual misstatement, and it is the kind discovered at transcript or reference check rather than at interview. It costs nothing to prevent. The same applies to in-progress certifications and courses.

**Check for agreement:** for a current student, the profile statement, the education entry, and any availability or work-permit note must all give the same completion date. Contradiction between them is worse than any single version.

### Professional Experience
- Rewrite bullet points to emphasize aspects most relevant to the target role
- Use 4-6 bullets for most recent role, 3-4 for previous, 2-3 for older
- **Emphasize measurable results** where possible: "Reduced processing time by X%", "Model adopted by the team"

#### Check tenure against visible output

Before finalizing, look at each role the way a stranger will: **date span versus how much work is shown.** A two-year role represented by a single project reads as low output, whether or not that is fair. The reader cannot know what filled the time, so they guess, and the guess is unflattering.

This bites hardest on **career changers** (part of the tenure went into learning the new field), on **long-cycle work** (industrial deployment, clinical or regulatory projects, research — one delivery genuinely takes quarters), and on anyone whose employer kept them on a single account or product.

Three honest fixes, in order of preference:

1. **Surface more real work.** Ask what else the period contained. There are often real secondary projects, internal tooling, or support work that never reached the CV because it felt minor. Best fix when the material exists.
2. **Make the phases within the role explicit.** If the span genuinely had stages, say so — an initial period learning the domain or supporting the team, then ownership of the named work through to delivery. A phased arc reads as a growth curve; an undifferentiated multi-year block reads as stagnation.
3. **Name what made the cycle long.** Data collection from a live environment, validation with domain experts, deployment and iteration against real output. Reviewers who know the domain accept this immediately.

**Never** pad with invented projects, and **never** quietly shorten the employment dates so the ratio looks better. Both are discoverable, and both are worse than the perception problem being solved.

**Prepare the interview answer too.** If a long span against little visible output survives these fixes, the question is coming. The candidate needs a ready two-part answer — what actually filled the time, and what the outcome was — recorded in their interview prep rather than improvised in the room.

### Handling Employment Gaps (Best Practice)
If there is a gap in your employment history:
- The gap should be explained matter-of-factly if needed
- Describe how professional development continued during the gap
- Frame as deliberate skill-building and career repositioning

### Publications
- Include Google Scholar link if applicable
- Select 3-4 most relevant publications (not always all of them)
- For non-academic roles, keep brief

### Evidence Links
Wherever the CV names a verifiable artifact - a public project, a hackathon entry, a publication - carry its link (`\href`) so a reader can verify the claim in one click. A CV whose strongest claims are checkable reads as more credible everywhere else too.

### Affiliations (formatting)

**Dates are italicized and right-aligned at the same column `\cventry` uses everywhere else in the CV, not in parentheses.** Use `\cvitemwithcomment` (a moderncv command) rather than a plain `\hfill` - `\hfill` right-aligns to the itemize's own `\linewidth`, which is not guaranteed to be the same value as `\cventry`'s `\maincolumnwidth`, so the date can land at a visibly different distance from the page edge than the Education/Experience/Leadership dates. `\cvitemwithcomment` uses that same `\maincolumnwidth` internally, so the alignment matches by construction rather than by eyeballing it:

```latex
\item{\cvitemwithcomment{}{California Alliance for Minority Participation (CAMP) Scholar, UC Riverside}{Sept 2024-Jun 2026}}
\item{\cvitemwithcomment{}{Member, Mathematics, Engineering, Science, Achievement (MESA)}{Jan 2026-Jun 2026}}
```

The first `{}` is the optional label prefix (`\cvitemwithcomment[vspace]{label}{text}{comment}`) - leave it empty here, since the affiliation name itself is the main text and a label would just add a redundant colon. Not `... UC Riverside (Sept 2024-Jun 2026)`, and not a bare `\hfill \textit{...}` - both were tried and superseded (2026-08-26) once the `\hfill` version was confirmed to land at a different column than `\cventry`'s dates via `pdftotext -layout` column comparison.

### Honors and Awards
- Keep format brief, one line each

### References
- List 2-4 references with name, title, company, and contact
- End with: "More references are available upon request."
- **Do not attach reference letters** - employers typically contact references directly

### LaTeX Special Characters (important)

Postings and profile data arrive as plain text; the CV is LaTeX. Escape these wherever they land in body text - company names, achievement bullets, skill lists:

| Character | Write | Typical trigger |
|---|---|---|
| `&` | `\&` | company names: Bang \& Olufsen, Brüel \& Kjær, H\&M |
| `%` | `\%` | quantified achievements: "cut latency by 40\%" |
| `$` | `\$` | salary and cost figures |
| `#` | `\#` | "ranked \#1", C\# |
| `_` | `\_` | file names, code identifiers |
| `~` | `\textasciitilde{}` | URLs, "approx. 5 years" tildes |
| `^` | `\textasciicircum{}` | version strings, math |

Two failure modes deserve special care:

- **`%` fails silently.** An unescaped `%` starts a LaTeX comment: the compile succeeds with zero errors, and everything after the `%` on that line vanishes from the PDF. `Cut inference latency by 40% and saved DKK 2M annually` renders as "Cut inference latency by 40" - the bullet keeps its impressive-looking fragment and loses the actual result. Quantified achievement bullets are exactly where the guidance steers you ("use numbers where possible"), so check every `%` in every bullet before compiling.
- **`&` fails loudly** inside `\cventry` (alignment-tab errors, `Missing } inserted`). The compile loop catches it, but escape employer names up front rather than debugging the compile.

Related trap: a bullet whose text begins with a literal `[` must be braced - `\item {[text]}` - or LaTeX parses the bracketed text as `\item`'s optional label and renders it clipped off the left page edge with a clean compile. The example CV's placeholder bullets are braced for exactly this reason.

## Compile-and-Inspect Loop (MANDATORY)

After writing the CV and before presenting to the user, always compile and visually inspect the PDF. Iterate until the layout is clean. Workflow:

1. Run `lualatex -interaction=nonstopmode main_<company>_<role>.tex`
2. Check the output page count: must be exactly 2
3. Read the PDF via the Read tool and visually inspect both pages
4. Check for **orphaned entries**: a `\cventry` title line must never sit alone at the bottom of page 1 with its bullets on page 2

### Fixing common page-break problems

**Problem: entry title on page 1, bullets orphaned to page 2**
Add `\needspace{5\baselineskip}` immediately before the problematic `\cventry`:
```latex
\needspace{5\baselineskip}
\item{\cventry{YEAR--YEAR}{Role Title}{Organization}{Location}{}{...}}
```
Include `\usepackage{needspace}` in the preamble.

**Caveat - use `\needspace` before entries, never before `\section` headings.** A section-level `\needspace` pushes the entire section (heading plus content) to the next page whenever the request does not fit, stranding empty space above and typically *adding* a page instead of saving one. Apply it only to the individual `\cventry` that actually orphans, and only after a compile shows the orphan.

**Problem: one trailing section spills to page 3 (e.g., References alone on page 3)**
Add `\enlargethispage{2-3\baselineskip}` before a late section (e.g., before `\section{Honors and Awards}`) to stretch page 2 by a few lines. This is the standard LaTeX rescue for near-miss overflows.

**Problem: 3 pages with significant content on page 3**
Cut content — do not compress geometry or `\vspace`. See "Relevance-weighted cutting" below for the rule.

**Problem: content finishes early on page 2 (feels thin)**
Restore the highest-relevance item that was previously cut — a CV that ends mid-page 2 looks incomplete.

## ATS Parseability

Most employers run CVs through an ATS before a human sees them, and the ATS reads the PDF's embedded **text layer**, not the rendered page. A CV can pass visual inspection and still extract as garbage. After the layout passes the compile-and-inspect loop, verify the text layer:

```bash
python tools/verify_pdf.py cv/main_<company>_<role>.pdf --dump-text cv/main_<company>_<role>.txt
```

Extraction tries **pypdf** first (`pip install pypdf`, BSD license), then Poppler `pdftotext`. If a fallback still uses `pdftotext -layout`, it must also pass `-enc UTF-8`: Xpdf-based builds default to Latin-1, which makes every non-ASCII character in a perfectly good CV read back as a replacement character. If neither extractor is available, skip the mechanical check with a warning and rely on the visual PDF read for keyword coverage.

What to check in the extraction:

- **Contact details as literal text.** The stock template's fontawesome contact icons extract as glyph names (`MOBILE-ALT`, `Envelope`) - harmless noise, because the actual address and number are printed beside them. The failure mode is a contact detail carried *only* by an icon or a hyperlink (like the `LinkedIn` link text, whose URL is not in the text layer): invisible to an ATS. The email address must always appear as printed text.
- **No garbled output.** `(cid:NNN)` markers or `�` characters mean a font is embedded without a Unicode mapping - an ATS sees the same garbage. This shows up with unusual fonts in custom templates, not with the stock moderncv setup under lualatex.
- **Reading order.** The stock banking style is single-column, so extraction order matches visual order. Custom templates (via `/add-template`) with sidebars or multi-column layouts can interleave unrelated lines; if extraction order is scrambled, the user is trading ATS compatibility for looks and should be told.
- **Keyword coverage.** Match the posting's required/preferred terms against the extracted text, in the posting's language. Prefer the posting's exact term over a synonym when it is truthfully applicable - ATS matching is often literal. Never add a keyword the profile does not support.

### Date fields must be ASCII ranges (confirmed ATS import failure)

This one is worth knowing about because it fails **silently**. A CV that passes every other check in this section - clean extraction, no `(cid:)` markers, contact details intact, correct reading order - can still have its dates dropped on import. In a real Workday resume import, a CV built from this template lost the end date of a short contract role and failed to import **any** education entry at all, forcing manual re-entry. Nothing about the PDF or its text layer looked wrong.

Two independent causes, both easy to avoid:

1. **`--` in a `\cventry` date renders as an en-dash (U+2013), not a hyphen.** LaTeX ligatures `--` (two ASCII hyphens, U+002D) into a single en-dash glyph, so `2016--2024` reaches the PDF text layer as `2016<U+2013>2024`. Many parsers split date ranges only on an ASCII hyphen and see no range at all. Write the date argument with a **single hyphen**:

   ```latex
   \item{\cventry{2016-2024}{Role Title}{Organization}{Location}{}{...}}   % parses
   \item{\cventry{2016--2024}{Role Title}{Organization}{Location}{}{...}}  % en-dash, may not
   ```

   This applies to the **date argument only**. Keep `--` everywhere it is typographically correct in prose, for example a numeric range like `EUR 600k--1M`.

2. **A bare single year gives the parser no end date.** A short contract, mandate or internship written as `\cventry{2016}` imports as a start date with nothing to close it. Use an explicit range, with months where the role ran under a year:

   ```latex
   \item{\cventry{Mar 2016 - Jul 2016}{Contract Role}{Client}{Location}{}{...}}
   ```

   Where a genuine range exists, use it even when a single year would be factually accurate - a degree written `1995` is true but imports worse than `1992-1995`. Do not invent a start date you do not have; a lone graduation year is fine, just expect it to be typed in by hand.

**Add this to the step 5d checks**: after extracting the text layer, confirm every experience entry shows a start *and* an end separated by an ASCII hyphen. Because the failure is silent and invisible in the PDF, the candidate otherwise discovers it only while filling in the application form.

## Page Budget - Hard 2-Page Limit

The CV **must** fit on exactly 2 pages when compiled. Use these content limits as a guide:

| Section | Max budget |
|---------|-----------|
| Profile statement | 3-4 lines |
| Skills | 5 items, each 1-2 lines |
| Most recent role | 4-5 bullets |
| Previous role | 2-3 bullets |
| Older roles | 2 bullets (1 line each) |
| Education | 2-3 entries |
| Publications | 2-3 entries |
| Awards | 3 entries, single line each |
| References | "Available upon request." (single line) |

**If in doubt, cut rather than squeeze.** Reducing `\vspace` or geometry scale to force-fit content makes the CV look cramped.

## Relevance-weighted cutting (the right way to shrink a CV)

**Cut by signal, not by section.** Static priority lists ("remove oldest education first, then shorten the earliest role...") are wrong when a relevant "lower-priority" item is competing with an irrelevant "higher-priority" item. An older-role bullet that speaks directly to the posting is worth more than a recent-role bullet that does not.

For every candidate line, score three things:

1. **Relevance to THIS posting** — does the line hit a named tool, keyword, or stated responsibility in the job ad?
2. **Uniqueness** — is it the only place this claim appears, or is it duplicated elsewhere in the CV?
3. **Narrative load** — does the cover letter depend on it? If cutting the line would force you to rewrite a cover-letter paragraph, it is load-bearing.

Cut the lowest-total-score line first, regardless of which section it sits in.

### Practical order of cuts (easiest → last resort)

1. **Redundancy.** If an achievement appears in both Core Competencies AND a role bullet, the Core Competencies version is usually the cleaner cut (the experience bullet is more concrete evidence).
2. **Profile-statement fluff.** A sentence that just restates what Publications or Skills will show. ("Peer-reviewed publications on X..." is already a Publications entry — profile can claim it once and stop.)
3. **Low-relevance experience bullets.** A bullet about work that does not touch posting keywords, wherever it sits. This cuts across sections before touching the structural list.
4. **Low-relevance supporting content.** An older-role bullet that does not speak to the target role. A certification that does not touch the posting's stack. A language entry that can be condensed to one line.
5. **Low-relevance publications.** Keep 1-2 publications that best match the posting. Cut the rest before touching experience bullets.
6. **Last-resort structural cuts.** Oldest education entry, tightening an older role to 2 bullets, collapsing Certifications into a single line. These only happen if the relevance-weighted cuts above have already been exhausted.

### Pitfalls to avoid

- Do not mechanically cut from the bottom of a static section list without checking relevance. "Cut the oldest role first" is wrong if that role is literally about the skill the posting asks for.
- Do not cut the one concrete example the cover letter leans on. Relevance is measured against the cover letter you wrote, not just the job posting — interviewers will have read both.
- Do not cut to fit if the fit is borderline (2.02 pages). Prefer `\enlargethispage{2-3\baselineskip}` on a late section for near-misses; reserve content cuts for genuine overflow (content on page 3 that is more than a single trailing section).

## Recommended Section Order

The section order varies by role type:

**For technical / data science / ML roles:**
1. Profile statement / elevator pitch
2. Core competencies / Skills
3. Professional Experience (reverse chronological)
4. Education (reverse chronological)
5. Languages
6. Publications & Awards
7. References

**For domain-specific / specialist roles:**
1. Profile statement / elevator pitch
2. Core competencies / Skills
3. Education (reverse chronological) - credentials are a key qualifier
4. Professional Experience (reverse chronological)
5. Publications & Awards
6. References
