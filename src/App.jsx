import React, { useState, useEffect, useRef } from 'react';
import mammoth from 'mammoth';
import { GoogleGenAI } from '@google/genai';
import { Document, Packer, Paragraph, TextRun } from 'docx';

const MOCK_JOBS = [
  {
    job_id: "1",
    job_title: "Frontend Developer",
    employer_name: "TechCorp",
    job_city: "Toronto",
    distance_miles: 15,
    work_environment: "Hybrid",
    employment_type: "Full-time",
    experience_level: "Mid-level",
    job_description: "Looking for a React developer with Vite experience to build intuitive user interfaces. Must know Tailwind CSS."
  },
  {
    job_id: "2",
    job_title: "Full Stack Engineer",
    employer_name: "Startup Inc",
    job_city: "Remote",
    distance_miles: 0,
    work_environment: "Remote",
    employment_type: "Full-time",
    experience_level: "Senior",
    job_description: "Seeking a developer to build scalable web applications. Experience with AI integrations and REST APIs is a major plus."
  },
  {
    job_id: "3",
    job_title: "Senior Data Analyst",
    employer_name: "DataMetrics Ltd",
    job_city: "Toronto",
    distance_miles: 30,
    work_environment: "On-site",
    employment_type: "Full-time",
    experience_level: "Senior",
    job_description: "Analyze large datasets, create complex SQL queries, build interactive dashboards, and drive strategic decision-making."
  },
  {
    job_id: "4",
    job_title: "Product Manager",
    employer_name: "Innovate AI",
    job_city: "New York",
    distance_miles: 75,
    work_environment: "Hybrid",
    employment_type: "Full-time",
    experience_level: "Senior",
    job_description: "Lead product strategy, define feature roadmaps, and collaborate with cross-functional engineering teams to launch AI features."
  },
  {
    job_id: "5",
    job_title: "Growth Marketing Specialist",
    employer_name: "BrandBoost",
    job_city: "Remote",
    distance_miles: 0,
    work_environment: "Remote",
    employment_type: "Contract",
    experience_level: "Mid-level",
    job_description: "Manage performance marketing campaigns, optimize acquisition channels, analyze conversion metrics, and scale growth."
  },
  {
    job_id: "6",
    job_title: "UI/UX Designer",
    employer_name: "CreativeStudio",
    job_city: "New York",
    distance_miles: 45,
    work_environment: "On-site",
    employment_type: "Full-time",
    experience_level: "Entry-level",
    job_description: "Design elegant user flows, wireframes, high-fidelity mockups, and interactive prototypes for mobile and web applications."
  },
  {
    job_id: "7",
    job_title: "Backend Software Engineer",
    employer_name: "CloudScale",
    job_city: "Toronto",
    distance_miles: 10,
    work_environment: "Hybrid",
    employment_type: "Contract",
    experience_level: "Mid-level",
    job_description: "Architect high-performance microservices, optimize database schemas, and build secure REST and GraphQL APIs."
  },
  {
    job_id: "8",
    job_title: "DevOps Engineer",
    employer_name: "InfraOps Global",
    job_city: "San Francisco",
    distance_miles: 20,
    work_environment: "Remote",
    employment_type: "Full-time",
    experience_level: "Senior",
    job_description: "Manage Kubernetes clusters, automate CI/CD pipelines with GitHub Actions, and maintain AWS cloud infrastructure reliability."
  },
  {
    job_id: "9",
    job_title: "QA Automation Tester",
    employer_name: "QualityFirst",
    job_city: "Toronto",
    distance_miles: 25,
    work_environment: "On-site",
    employment_type: "Part-time",
    experience_level: "Entry-level",
    job_description: "Develop automated test suites using Cypress and Playwright, conduct regression testing, and ensure high code quality."
  },
  {
    job_id: "10",
    job_title: "AI / ML Engineer",
    employer_name: "NeuralLabs",
    job_city: "San Francisco",
    distance_miles: 35,
    work_environment: "Hybrid",
    employment_type: "Full-time",
    experience_level: "Senior",
    job_description: "Fine-tune Large Language Models, build RAG pipelines, and integrate generative AI capabilities into enterprise platforms."
  },
  {
    job_id: "11",
    job_title: "Cyber Security Specialist",
    employer_name: "SecureShield",
    job_city: "New York",
    distance_miles: 50,
    work_environment: "On-site",
    employment_type: "Full-time",
    experience_level: "Mid-level",
    job_description: "Perform penetration testing, audit cloud security posture, implement zero-trust access protocols, and respond to security incidents."
  },
  {
    job_id: "12",
    job_title: "Mobile App Developer (iOS/Android)",
    employer_name: "AppWorks",
    job_city: "Remote",
    distance_miles: 0,
    work_environment: "Remote",
    employment_type: "Contract",
    experience_level: "Entry-level",
    job_description: "Build cross-platform mobile apps using React Native or Flutter, integrate push notifications, and optimize UI performance."
  },
  {
    job_id: "13",
    job_title: "Cloud Infrastructure Architect",
    employer_name: "Enterprise Cloud",
    job_city: "Toronto",
    distance_miles: 40,
    work_environment: "Hybrid",
    employment_type: "Full-time",
    experience_level: "Senior",
    job_description: "Design multi-region GCP/AWS architecture, establish Terraform infrastructure-as-code, and enforce security compliance."
  },
  {
    job_id: "14",
    job_title: "Lead Technical Writer",
    employer_name: "DocuHub",
    job_city: "Remote",
    distance_miles: 0,
    work_environment: "Remote",
    employment_type: "Part-time",
    experience_level: "Mid-level",
    job_description: "Create developer documentation, API references, architecture guides, and user manuals for developer-facing products."
  }
];

export default function App() {
  const [step, setStep] = useState(1);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [keyError, setKeyError] = useState('');
  const [showKey, setShowKey] = useState(false);

  // File input ref for clearing
  const fileInputRef = useRef(null);

  // Master Resume state (never overwritten during analysis)
  const [masterResumeText, setMasterResumeText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [isResumeOpen, setIsResumeOpen] = useState(true);

  const [jobs, setJobs] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState(50);

  // Category Dropdown Filter States
  const [workEnvironment, setWorkEnvironment] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');

  const [searchError, setSearchError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);

  const [analyzingJobId, setAnalyzingJobId] = useState(null);
  const [analyzedJobs, setAnalyzedJobs] = useState({});
  // Track accepted bullet edits per job: { [job_id]: { [bullet_id]: boolean } }
  const [acceptedBullets, setAcceptedBullets] = useState({});

  useEffect(() => {
    const authStatus = localStorage.getItem('jobsearch_auth');
    const savedKey = localStorage.getItem('jobsearch_gemini_key') || localStorage.getItem('gemini_api_key');
    if (authStatus === 'true' && savedKey && savedKey.length > 20) {
      setStep(3);
      setApiKey(savedKey);
    }
  }, []);

  // Search input validation check
  const hasJobTitle = Boolean(searchQuery.trim());
  const hasLocation = Boolean(location.trim());
  const hasResume = Boolean((masterResumeText || resumeText).trim());
  const isSearchValid = (hasJobTitle && hasLocation) || (hasResume && hasJobTitle);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === '7777') {
      setPinError('');
      setStep(2);
    } else {
      setPinError('Invalid passcode. Please try again.');
    }
  };

  const handleKeySubmit = (e) => {
    e.preventDefault();
    const trimmedKey = apiKey.trim();
    if (trimmedKey.length > 20) {
      setKeyError('');
      localStorage.setItem('jobsearch_auth', 'true');
      localStorage.setItem('jobsearch_gemini_key', trimmedKey);
      localStorage.setItem('gemini_api_key', trimmedKey);
      setStep(3);
    } else {
      setKeyError('API Key must be greater than 20 characters.');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      console.log("Full Extracted Text:", result.value);
      setMasterResumeText(result.value);
      setResumeText(result.value);
      if (searchError) setSearchError('');
    } catch (err) {
      console.error('Error parsing .docx file:', err);
    }
  };

  const handleClearResume = () => {
    setMasterResumeText('');
    setResumeText('');
    setIsResumeOpen(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const searchJobs = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!isSearchValid) {
      setSearchError("Please enter a Job Title and Location, or upload a Resume with a Job Title to search.");
      return;
    }

    setIsSearching(true);
    setSearchError('');

    setTimeout(() => {
      const q = searchQuery.trim().toLowerCase();
      const loc = location.trim().toLowerCase();
      const rad = Number(radius) || 50;

      const filtered = MOCK_JOBS.filter((job) => {
        const matchesQuery =
          !q ||
          job.job_title.toLowerCase().includes(q) ||
          job.job_description.toLowerCase().includes(q) ||
          job.employer_name.toLowerCase().includes(q);

        const isRemoteLocation = !loc || loc === 'remote';
        const matchesLocation =
          isRemoteLocation ||
          job.job_city.toLowerCase().includes(loc) ||
          job.job_city.toLowerCase() === 'remote';

        const matchesRadius =
          job.job_city.toLowerCase() === 'remote' ||
          job.distance_miles === 0 ||
          job.distance_miles <= rad;

        const matchEnv = !workEnvironment || job.work_environment === workEnvironment;
        const matchType = !employmentType || job.employment_type === employmentType;
        const matchLevel = !experienceLevel || job.experience_level === experienceLevel;

        return matchesQuery && matchesLocation && matchesRadius && matchEnv && matchType && matchLevel;
      });

      setJobs(filtered);
      setHasSearched(true);
      setIsSearching(false);
      setSelectedJobId(null);
    }, 600);
  };

  const analyzeAndTailor = async (job) => {
    if (!job) return;
    setAnalyzingJobId(job.job_id);

    const key = localStorage.getItem('jobsearch_gemini_key') || localStorage.getItem('gemini_api_key');

    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const systemInstruction = "Act as an ATS expert. Analyze the provided resume against the job description. Do not fabricate experience. Return a strict JSON object with exactly three keys: 'fit_score' (an integer from 1 to 100), 'key_skills_matched' (an array of 3 to 6 key skill strings), and 'suggested_bullet_edits' (an array of 3 to 5 objects, where each object has 'id' (a unique string id like 'b1', 'b2'), 'original_bullet' (a specific sentence or bullet point extracted from the user's resume), and 'tailored_bullet' (an improved version optimized for this job)).";

      const prompt = `Master Resume:\n${masterResumeText || resumeText || 'No resume provided.'}\n\nJob Description:\n${job.job_description}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json"
        }
      });

      const parsed = JSON.parse(response.text);
      setAnalyzedJobs((prev) => ({ ...prev, [job.job_id]: parsed }));

      if (parsed.suggested_bullet_edits) {
        const initialAccepted = {};
        parsed.suggested_bullet_edits.forEach((edit, idx) => {
          const editId = edit.id || `b-${idx}`;
          initialAccepted[editId] = true;
        });
        setAcceptedBullets((prev) => ({ ...prev, [job.job_id]: initialAccepted }));
      }
    } catch (err) {
      console.error('Error analyzing resume:', err);
    } finally {
      setAnalyzingJobId(null);
    }
  };

  const toggleBulletAccept = (jobId, editId) => {
    setAcceptedBullets((prev) => {
      const currentJobAccepted = prev[jobId] || {};
      return {
        ...prev,
        [jobId]: {
          ...currentJobAccepted,
          [editId]: !currentJobAccepted[editId]
        }
      };
    });
  };

  const downloadTailoredResume = async () => {
    const currentAnalysis = selectedJobId ? analyzedJobs[selectedJobId] : null;
    if (!currentAnalysis) return;

    const baseText = masterResumeText || resumeText || '';
    const jobAcceptedMap = (selectedJobId && acceptedBullets[selectedJobId]) || {};
    const edits = currentAnalysis.suggested_bullet_edits || [];

    const replacementMap = new Map();
    edits.forEach((edit, idx) => {
      const editId = edit.id || `b-${idx}`;
      if (jobAcceptedMap[editId] !== false && edit.original_bullet && edit.tailored_bullet) {
        replacementMap.set(edit.original_bullet.trim(), edit.tailored_bullet.trim());
      }
    });

    const lines = baseText.split('\n');

    const paragraphs = lines.map((line) => {
      const trimmed = line.trim();
      let finalText = line;

      if (trimmed && replacementMap.has(trimmed)) {
        finalText = replacementMap.get(trimmed);
      } else if (trimmed) {
        for (const [orig, tail] of replacementMap.entries()) {
          if (orig && trimmed.includes(orig)) {
            finalText = line.replace(orig, tail);
            break;
          }
        }
      }

      return new Paragraph({
        children: [new TextRun({ text: finalText })]
      });
    });

    try {
      const doc = new Document({
        sections: [
          {
            children: paragraphs.length > 0
              ? paragraphs
              : [new Paragraph({ children: [new TextRun({ text: baseText })] })]
          }
        ]
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Tailored_Resume.docx';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating docx file:', err);
    }
  };

  const handleReset = () => {
    localStorage.clear();
    setPin('');
    setPinError('');
    setApiKey('');
    setKeyError('');
    setMasterResumeText('');
    setResumeText('');
    setIsResumeOpen(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setJobs([]);
    setIsSearching(false);
    setSearchQuery('');
    setLocation('');
    setRadius(50);
    setWorkEnvironment('');
    setEmploymentType('');
    setExperienceLevel('');
    setSearchError('');
    setHasSearched(false);
    setSelectedJobId(null);
    setAnalyzingJobId(null);
    setAnalyzedJobs({});
    setAcceptedBullets({});
    setStep(1);
  };

  const selectedJob = jobs.find((j) => j.job_id === selectedJobId);
  const currentAnalysis = selectedJobId ? analyzedJobs[selectedJobId] : null;
  const isCurrentAnalyzing = analyzingJobId === selectedJobId;

  return (
    <div
      className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 selection:bg-blue-500 selection:text-white ${
        step === 3 ? 'items-start pt-6 justify-start' : 'items-center justify-center'
      }`}
    >
      {/* Background glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl" />
      </div>

      <div className={`z-10 ${step === 3 ? 'w-full max-w-7xl mx-auto flex flex-col h-full' : 'w-full max-w-md'}`}>
        {/* Step Indicator Header (Steps 1 & 2) */}
        {step !== 3 && (
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center space-x-2 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-full mb-3 text-xs text-blue-400 font-medium tracking-wide uppercase">
              <span>Authentication Step {step} of 3</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              JobSearch <span className="text-blue-500">Portal</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {step === 1 && 'Enter your security PIN to begin.'}
              {step === 2 && 'Provide your Gemini API key to continue.'}
            </p>
          </div>
        )}

        {/* Step 1 & Step 2 Card */}
        {step !== 3 && (
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 shadow-2xl rounded-2xl p-6 sm:p-8 transition-all duration-300">
            {step === 1 && (
              <form onSubmit={handlePinSubmit} className="space-y-5">
                <div>
                  <label htmlFor="passcode-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Passcode PIN
                  </label>
                  <input
                    id="passcode-input"
                    type="password"
                    maxLength={4}
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      if (pinError) setPinError('');
                    }}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-center text-2xl tracking-[0.5em] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:tracking-normal placeholder:text-slate-600"
                    autoFocus
                  />
                  {pinError && (
                    <p className="mt-2 text-sm text-rose-400 font-medium flex items-center gap-1.5">
                      <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {pinError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 transition-all duration-200"
                >
                  Verify Passcode
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleKeySubmit} className="space-y-5">
                <div>
                  <label htmlFor="api-key-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Gemini API Key
                  </label>
                  <div className="relative">
                    <input
                      id="api-key-input"
                      type={showKey ? 'text' : 'password'}
                      placeholder="AIzaSy..."
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value);
                        if (keyError) setKeyError('');
                      }}
                      className="w-full pl-4 pr-12 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-600"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs font-medium px-1.5 py-1 rounded bg-slate-800/50"
                    >
                      {showKey ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {keyError && (
                    <p className="mt-2 text-sm text-rose-400 font-medium flex items-center gap-1.5">
                      <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {keyError}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-slate-400">
                    Key must be longer than 20 characters. It will be stored safely in your local browser storage.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 transition-all duration-200"
                >
                  Save & Continue
                </button>
              </form>
            )}
          </div>
        )}

        {/* Step 3: Workspace Header & Responsive Split-Pane Master-Detail Layout */}
        {step === 3 && (
          <div className="w-full flex flex-col h-full space-y-4">
            {/* Top Workspace Header Row */}
            <div className="w-full flex justify-between items-center mb-2 pb-2 border-b border-slate-800/80 shrink-0">
              <h2 className="text-xl font-bold text-blue-400">JobSearch Workspace</h2>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-red-400 px-3 py-1 border border-slate-700 hover:border-red-500/50 rounded transition-colors"
              >
                Reset App / Clear LocalStorage
              </button>
            </div>

            {/* Main Responsive Split-Pane Container */}
            <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden h-[calc(100vh-140px)] w-full text-left">
              {/* Left Column (Master List & Controls) */}
              <div
                className={`w-full md:w-2/5 flex flex-col gap-4 overflow-y-auto pr-2 border-b md:border-b-0 md:border-r border-slate-800/80 ${
                  selectedJobId ? 'hidden md:flex' : 'flex'
                }`}
              >
                {/* Collapsible Resume Upload Section */}
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 shadow-xl rounded-2xl p-4 shrink-0 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Resume
                      </h3>
                      {!isResumeOpen && masterResumeText && (
                        <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Master resume loaded
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {masterResumeText && (
                        <button
                          type="button"
                          onClick={handleClearResume}
                          className="text-[11px] text-rose-400 hover:text-rose-300 font-medium px-2 py-0.5 rounded border border-rose-900/50 hover:border-rose-800 bg-rose-950/30 transition-colors"
                        >
                          Clear Resume
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsResumeOpen(!isResumeOpen)}
                        className="text-[11px] text-blue-400 hover:text-blue-300 font-medium px-2 py-0.5 rounded border border-slate-800 hover:border-slate-700 bg-slate-950/50 transition-colors"
                      >
                        {isResumeOpen ? 'Minimize' : 'Expand'}
                      </button>
                    </div>
                  </div>

                  {isResumeOpen && (
                    <div className="space-y-3 pt-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".docx"
                        onChange={handleFileUpload}
                        className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 file:cursor-pointer bg-slate-950 border border-slate-800 rounded-xl p-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      {masterResumeText && (
                        <div className="space-y-2 mt-2">
                          <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Master resume parsed & locked!
                          </p>
                          <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-300 whitespace-pre-wrap break-words max-h-36 overflow-y-auto leading-relaxed">
                            {masterResumeText}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Search & Filters Form */}
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 shadow-xl rounded-2xl p-5 space-y-3 shrink-0">
                  <form onSubmit={searchJobs} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Keywords</label>
                        <input
                          type="text"
                          placeholder="Job title or keywords..."
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            if (searchError) setSearchError('');
                          }}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Location</label>
                        <input
                          type="text"
                          placeholder="Location (e.g. Toronto)..."
                          value={location}
                          onChange={(e) => {
                            setLocation(e.target.value);
                            if (searchError) setSearchError('');
                          }}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-600"
                        />
                      </div>
                    </div>

                    {/* Category Dropdown Filters */}
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1">Environment</label>
                        <select
                          value={workEnvironment}
                          onChange={(e) => setWorkEnvironment(e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Any Environment</option>
                          <option value="Remote">Remote</option>
                          <option value="On-site">On-site</option>
                          <option value="Hybrid">Hybrid</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1">Type</label>
                        <select
                          value={employmentType}
                          onChange={(e) => setEmploymentType(e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Any Type</option>
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1">Level</label>
                        <select
                          value={experienceLevel}
                          onChange={(e) => setExperienceLevel(e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Any Level</option>
                          <option value="Entry-level">Entry-level</option>
                          <option value="Mid-level">Mid-level</option>
                          <option value="Senior">Senior</option>
                        </select>
                      </div>
                    </div>

                    {/* Radius Slider */}
                    <div className="space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <div className="flex justify-between items-center text-[11px] font-semibold text-slate-300">
                        <span>Radius</span>
                        <span className="text-blue-400 font-mono">{radius} miles</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        value={radius}
                        onChange={(e) => setRadius(e.target.value)}
                        className="w-full h-1.5 bg-slate-900 border border-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSearching || !isSearchValid}
                      className={`w-full py-2.5 px-4 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 ${
                        !isSearchValid || isSearching
                          ? 'bg-slate-800/80 text-slate-500 border border-slate-700/60 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-lg shadow-blue-600/20'
                      }`}
                    >
                      {isSearching ? 'Searching...' : 'Search Jobs'}
                    </button>
                  </form>

                  {/* Inline Validation & Search Error Message */}
                  {searchError && (
                    <p className="text-xs text-rose-400 font-medium flex items-start gap-1.5 p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl shrink-0 mt-2">
                      <svg className="w-4 h-4 fill-current shrink-0 mt-0.5" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>{searchError}</span>
                    </p>
                  )}
                </div>

                {/* Jobs List (Master View) */}
                <div className="flex-1 space-y-3">
                  {hasSearched && jobs.length === 0 && !isSearching && (
                    <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl text-center">
                      <p className="text-xs text-slate-400">
                        No jobs match your selected filters. Try expanding your search radius or changing keywords.
                      </p>
                    </div>
                  )}

                  {jobs.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
                        Search Results ({jobs.length})
                      </h3>
                      <div className="space-y-2.5">
                        {jobs.map((job) => {
                          const isSelected = selectedJobId === job.job_id;
                          const jobAnalysis = analyzedJobs[job.job_id];

                          return (
                            <div
                              key={job.job_id}
                              onClick={() => setSelectedJobId(job.job_id)}
                              className={`p-4 rounded-xl cursor-pointer transition-all border ${
                                isSelected
                                  ? 'bg-slate-900 border-blue-500 shadow-md shadow-blue-500/10'
                                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="text-sm font-bold text-white">{job.job_title}</h4>
                                  <p className="text-xs text-slate-400 mt-0.5">{job.employer_name}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-medium rounded-full">
                                    {job.job_city}
                                  </span>
                                  {jobAnalysis && (
                                    <div className="bg-emerald-950/90 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                      Fit: {jobAnalysis.fit_score}%
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-1.5 mt-2">
                                <span className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 text-[10px] text-slate-400 rounded">
                                  {job.work_environment}
                                </span>
                                <span className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 text-[10px] text-slate-400 rounded">
                                  {job.employment_type}
                                </span>
                                <span className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 text-[10px] text-slate-400 rounded">
                                  {job.experience_level}
                                </span>
                              </div>

                              <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                                {job.job_description}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column (Detail View & Gemini ATS Tools) */}
              <div
                className={`w-full md:flex-1 bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 md:p-6 overflow-y-auto space-y-6 ${
                  !selectedJobId ? 'hidden md:block' : 'block'
                }`}
              >
                {/* Mobile Back Button */}
                <button
                  type="button"
                  onClick={() => setSelectedJobId(null)}
                  className="md:hidden mb-2 text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                >
                  ← Back to Jobs List
                </button>

                {!selectedJob ? (
                  <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-500 mb-2">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-200">No Job Selected</h3>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Select a job listing from the list on the left to view full job details and tailor your resume with Gemini AI.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Header & Title */}
                    <div className="pb-5 border-b border-slate-800">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h2 className="text-2xl font-extrabold text-white tracking-tight">{selectedJob.job_title}</h2>
                          <p className="text-sm font-semibold text-blue-400 mt-1">{selectedJob.employer_name}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-xs font-medium text-slate-300 rounded-lg">
                              🏠 {selectedJob.work_environment}
                            </span>
                            <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-xs font-medium text-slate-300 rounded-lg">
                              💼 {selectedJob.employment_type}
                            </span>
                            <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-xs font-medium text-slate-300 rounded-lg">
                              📈 {selectedJob.experience_level}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold rounded-full">
                            {selectedJob.job_city}
                          </span>
                          {selectedJob.distance_miles > 0 && (
                            <p className="text-xs text-slate-500 mt-1.5">{selectedJob.distance_miles} miles away</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Job Description */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Job Description</h3>
                      <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs text-slate-300 leading-relaxed space-y-3">
                        <p>{selectedJob.job_description}</p>
                      </div>
                    </div>

                    {/* Action: Analyze & Tailor Button - Hidden if currentAnalysis exists */}
                    {!currentAnalysis && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => analyzeAndTailor(selectedJob)}
                          disabled={isCurrentAnalyzing}
                          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          {isCurrentAnalyzing ? 'Analyzing with Gemini...' : 'Analyze & Tailor Resume for this Role'}
                        </button>
                      </div>
                    )}

                    {/* Analyzing Loading Message */}
                    {isCurrentAnalyzing && (
                      <div className="p-4 bg-blue-950/40 border border-blue-800/50 rounded-xl text-center space-y-2 animate-pulse">
                        <div className="inline-flex items-center justify-center gap-2 text-blue-400 font-medium text-sm">
                          <svg className="animate-spin w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Gemini is optimizing your resume...
                        </div>
                      </div>
                    )}

                    {/* Tailored Result Card for currentAnalysis */}
                    {currentAnalysis && (
                      <div className="p-5 bg-slate-950 border border-emerald-500/30 rounded-xl space-y-5 shadow-xl">
                        {/* Header & Fit Score */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                          <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">ATS Optimization Result</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Tailored recommendations for your resume</p>
                          </div>
                          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                            <span className="text-xs text-emerald-400 font-medium">Fit Score:</span>
                            <span className="text-xl font-extrabold text-emerald-400">{currentAnalysis.fit_score}%</span>
                          </div>
                        </div>

                        {/* Key Skills Matched */}
                        {currentAnalysis.key_skills_matched && currentAnalysis.key_skills_matched.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                              Key Skills Matched:
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {currentAnalysis.key_skills_matched.map((skill, idx) => (
                                <span key={idx} className="px-2.5 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-xs font-medium rounded-lg">
                                  ✓ {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Suggested Bullet Point Improvements */}
                        {currentAnalysis.suggested_bullet_edits && currentAnalysis.suggested_bullet_edits.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                Suggested Bullet Point Improvements ({currentAnalysis.suggested_bullet_edits.length})
                              </h4>
                              <span className="text-[11px] text-slate-400">Select edits to apply</span>
                            </div>

                            <div className="space-y-3">
                              {currentAnalysis.suggested_bullet_edits.map((edit, index) => {
                                const editId = edit.id || `b-${index}`;
                                const isAccepted = acceptedBullets[selectedJobId]?.[editId] !== false;

                                return (
                                  <div
                                    key={editId}
                                    className={`p-3.5 rounded-xl border transition-all ${
                                      isAccepted
                                        ? 'bg-slate-900/90 border-emerald-500/40 shadow-sm'
                                        : 'bg-slate-950/60 border-slate-800 opacity-60'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          id={`checkbox-${editId}`}
                                          checked={isAccepted}
                                          onChange={() => toggleBulletAccept(selectedJobId, editId)}
                                          className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                                        />
                                        <label htmlFor={`checkbox-${editId}`} className="text-xs font-bold text-slate-200 cursor-pointer">
                                          Suggestion #{index + 1}
                                        </label>
                                      </div>
                                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                        isAccepted ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                                      }`}>
                                        {isAccepted ? 'Applied' : 'Ignored'}
                                      </span>
                                    </div>

                                    <div className="space-y-2 text-xs">
                                      {/* Original Bullet */}
                                      <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Original Text:</span>
                                        <p className="text-slate-400 line-through leading-relaxed">{edit.original_bullet}</p>
                                      </div>

                                      {/* Tailored Bullet */}
                                      <div className="p-2.5 bg-emerald-950/30 border border-emerald-500/30 rounded-lg space-y-1">
                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">AI Enhanced Version:</span>
                                        <p className="text-emerald-200 font-medium leading-relaxed">{edit.tailored_bullet}</p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Download Button */}
                        <button
                          type="button"
                          onClick={downloadTailoredResume}
                          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 mt-4"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download Tailored Resume (.docx)
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}