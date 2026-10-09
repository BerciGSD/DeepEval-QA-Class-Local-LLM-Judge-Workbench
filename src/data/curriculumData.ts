import { ModuleInfo, MetricDefinition, ExerciseTask } from '../types/curriculum';

export const MODULES: ModuleInfo[] = [
  {
    id: 1,
    title: 'Module 1: 100% Local $0 Environment Setup',
    subtitle: 'Ollama local judge, CLI telemetry opt-out, virtual environments',
    duration: '25 mins',
    istqbBridge: 'Test Harness & Environment Configuration (ISO 29119 / ISTQB Test Environment)',
    status: 'active',
    objectives: [
      'Create dedicated Python 3.10+ virtual environment (venv)',
      'Install deepeval and configure strictly offline local evaluation',
      'Download and benchmark hardware-sized Ollama local judge',
      'Execute global CLI configuration: deepeval set-ollama',
      'Verify zero cloud dependency and zero token cost'
    ],
    keySyntax: [
      'python -m venv .venv',
      'pip install deepeval',
      'ollama pull <model>',
      'deepeval set-ollama --model=<model>',
      'export CONFIDENT_AI_API_KEY=""'
    ]
  },
  {
    id: 2,
    title: 'Module 2: Core Single-Turn Metrics & LLMTestCase',
    subtitle: 'AnswerRelevancy, Faithfulness, Hallucination with User Story alignment',
    duration: '45 mins',
    istqbBridge: 'Test Case Specification & Boundary Value Analysis (Oracle Comparison)',
    status: 'locked',
    objectives: [
      'Master the 4 core properties of LLMTestCase (input, actual_output, expected_output, retrieval_context)',
      'Implement AnswerRelevancyMetric (semantic vector & reasoning check)',
      'Implement FaithfulnessMetric (factuality against retrieved context truths)',
      'Implement HallucinationMetric (detecting fabricated context claims)',
      'Calibrate pass/fail score thresholds (0.5 vs 0.7 vs 0.9)'
    ],
    keySyntax: [
      'from deepeval.test_case import LLMTestCase',
      'from deepeval.metrics import AnswerRelevancyMetric, FaithfulnessMetric, HallucinationMetric',
      'metric = AnswerRelevancyMetric(threshold=0.7)',
      'metric.measure(test_case)'
    ]
  },
  {
    id: 3,
    title: 'Module 3: Custom Rubrics with G-Eval',
    subtitle: 'Plain-language criteria, tone/format, safety/PII, and custom user story',
    duration: '50 mins',
    istqbBridge: 'Static Analysis, Equivalence Partitioning & Non-Functional Quality Attributes',
    status: 'locked',
    objectives: [
      'Understand LLM-as-Judge weighted criteria breakdown & step generation',
      'Implement G-Eval Use Case A: Plain-language functional correctness rubric',
      'Implement G-Eval Use Case B: Tone and strict format compliance (JSON/Markdown)',
      'Implement G-Eval Use Case C: Safety, prompt leak, and PII containment',
      'Implement G-Eval Use Case D: Bespoke rubric for learner-provided QA user story'
    ],
    keySyntax: [
      'from deepeval.metrics import GEval',
      'from deepeval.test_case import LLMTestCaseParams',
      'criteria = "Determine if response is polite and adheres to 200 words."',
      'geval = GEval(name="Tone", criteria=criteria, evaluation_params=[...])'
    ]
  },
  {
    id: 4,
    title: 'Module 4: Automated CI/CD Pytest Integration',
    subtitle: 'Cumulative test suite, assert_test, CLI runs, and judge score variance',
    duration: '40 mins',
    istqbBridge: 'Test Execution Automation, Flakiness Analysis & Regression Testing',
    status: 'locked',
    objectives: [
      'Structure test files as idiomatic pytest suites (test_*.py)',
      'Use deepeval assert_test() inside standard pytest functions',
      'Run tests via terminal: deepeval test run test_qa_suite.py',
      'Diagnose and stabilize score variance inherent to small local models',
      'Configure test retries and threshold tolerances'
    ],
    keySyntax: [
      'from deepeval import assert_test',
      'def test_customer_support_rag():',
      '    assert_test(test_case, [relevancy_metric, faithfulness_metric])',
      'deepeval test run test_qa_suite.py'
    ]
  },
  {
    id: 5,
    title: 'Module 5: Portfolio Artifact Creation & GitHub',
    subtitle: 'Structuring the production repo, documentation, and resume-ready assets',
    duration: '35 mins',
    istqbBridge: 'Test Deliverables, Defect Reporting & QA Portfolio Documentation',
    status: 'locked',
    objectives: [
      'Package cumulative project into clean production git repository structure',
      'Write technical README documenting local Ollama test harness',
      'Commit and push to GitHub with step-by-step beginner guidance',
      'Add ISTQB-to-AI-Quality resume bullet points showcasing LLM evaluation automation'
    ],
    keySyntax: [
      'git init',
      'git add . && git commit -m "feat: complete local deepeval evaluation suite"',
      'git remote add origin <repo-url>',
      'git push -u origin main'
    ]
  }
];

export const METRIC_DEFINITIONS: MetricDefinition[] = [
  {
    id: 'answer_relevancy',
    name: 'AnswerRelevancyMetric',
    category: 'core_single_turn',
    qaEquivalent: 'Functional Acceptance: Does the actual output directly address the user query without drift or verbosity?',
    formulaDescription: 'Measures semantic relevance between input query and actual output via local judge step extraction.',
    requiredFields: ['input', 'actual_output'],
    optionalFields: ['expected_output'],
    defaultThreshold: 0.7,
    sampleCode: `from deepeval.test_case import LLMTestCase
from deepeval.metrics import AnswerRelevancyMetric

test_case = LLMTestCase(
    input="How do I reset my account password?",
    actual_output="Navigate to Settings > Security and click 'Reset Password'. You will receive an email link."
)

metric = AnswerRelevancyMetric(threshold=0.7)
metric.measure(test_case)
print(f"Score: {metric.score}, Reason: {metric.reason}")`,
    explanation: 'Evaluates whether statements in actual_output are pertinent to input. If the model starts explaining unrelated security tips, the score drops.'
  },
  {
    id: 'faithfulness',
    name: 'FaithfulnessMetric',
    category: 'core_single_turn',
    qaEquivalent: 'RAG Ground Truth Verification: Does the answer strictly adhere to the retrieved reference documents?',
    formulaDescription: 'Truthful statements divided by total generated claims against retrieval_context.',
    requiredFields: ['input', 'actual_output', 'retrieval_context'],
    optionalFields: [],
    defaultThreshold: 0.8,
    sampleCode: `from deepeval.test_case import LLMTestCase
from deepeval.metrics import FaithfulnessMetric

test_case = LLMTestCase(
    input="What is the return window for electronics?",
    actual_output="Customers can return electronics within 14 days of purchase.",
    retrieval_context=[
        "Our standard policy allows 30 days for clothing and 14 days for all electronic items."
    ]
)

metric = FaithfulnessMetric(threshold=0.8)
metric.measure(test_case)
print(f"Score: {metric.score}, Reason: {metric.reason}")`,
    explanation: 'Extracts claims from actual_output and verifies each claim against sentences in retrieval_context. Vital for RAG testing!'
  },
  {
    id: 'hallucination',
    name: 'HallucinationMetric',
    category: 'core_single_turn',
    qaEquivalent: 'Negative Testing & Defect Detection: Did the model invent facts absent from source context?',
    formulaDescription: 'Measures proportion of hallucinated statements (inverted score: 0 = hallucination, 1 = clean).',
    requiredFields: ['actual_output', 'context'],
    optionalFields: ['input'],
    defaultThreshold: 0.5,
    sampleCode: `from deepeval.test_case import LLMTestCase
from deepeval.metrics import HallucinationMetric

test_case = LLMTestCase(
    input="Where is the company headquartered?",
    actual_output="The company is headquartered in Zurich, Switzerland and was founded in 1998.",
    context=["The company was founded in Zurich, Switzerland."]
)

metric = HallucinationMetric(threshold=0.5)
metric.measure(test_case)
print(f"Score: {metric.score}, Reason: {metric.reason}")`,
    explanation: 'Notice context parameter name difference: HallucinationMetric uses context (list of strings), whereas FaithfulnessMetric uses retrieval_context.'
  },
  {
    id: 'geval_rubric',
    name: 'G-Eval Custom Rubric',
    category: 'geval_custom',
    qaEquivalent: 'Custom QA Test Oracle: Defines arbitrary grading criteria as formal test rules.',
    formulaDescription: 'LLM generates chain-of-thought evaluation steps, weights criteria, and scores 0.0 - 1.0.',
    requiredFields: ['input', 'actual_output'],
    optionalFields: ['expected_output', 'retrieval_context'],
    defaultThreshold: 0.7,
    sampleCode: `from deepeval.metrics import GEval
from deepeval.test_case import LLMTestCase, LLMTestCaseParams

criteria = """
Assess whether the response provides a clear, empathetic tone,
avoids technical jargon, and includes a clear call to action.
"""

metric = GEval(
    name="Customer Empathy & Tone",
    criteria=criteria,
    evaluation_params=[LLMTestCaseParams.INPUT, LLMTestCaseParams.ACTUAL_OUTPUT],
    threshold=0.7
)

metric.measure(test_case)
print(f"Score: {metric.score}, Reason: {metric.reason}")`,
    explanation: 'G-Eval transforms qualitative requirements into quantitative, reproducible evaluation scores using chain-of-thought grading.'
  }
];

export const CUMULATIVE_PROJECT_CODE = `# ==============================================================================
# PROJECT: tests/test_qa_suite.py
# ROLE: AI Quality Engineering Evaluation Suite (100% Local / Zero Token Cost)
# FRAMEWORK: Pytest + DeepEval with Ollama Local Judge
# ==============================================================================

import pytest
from deepeval import assert_test
from deepeval.test_case import LLMTestCase, LLMTestCaseParams
from deepeval.metrics import (
    AnswerRelevancyMetric,
    FaithfulnessMetric,
    HallucinationMetric,
    GEval
)

# ------------------------------------------------------------------------------
# TEST FIXTURES & DATA (ISTQB: Test Data Setup)
# ------------------------------------------------------------------------------
@pytest.fixture
def product_return_knowledge_base():
    """Simulates RAG retrieved documents from internal knowledge base."""
    return [
        "Electronics must be returned within 14 calendar days in original packaging.",
        "Refurbished items are eligible for store credit only, not direct cash refund.",
        "Shipping fees for returns due to customer preference are non-refundable."
    ]

# ------------------------------------------------------------------------------
# MODULE 2 TESTS: CORE SINGLE-TURN METRICS
# ------------------------------------------------------------------------------
def test_customer_support_relevancy():
    """Verify response directly addresses user question without drift."""
    test_case = LLMTestCase(
        input="Can I get cash back for a returned refurbished laptop?",
        actual_output="Refurbished items are eligible for store credit only, not cash refunds. You must initiate the return within 14 days."
    )
    
    relevancy_metric = AnswerRelevancyMetric(threshold=0.7)
    assert_test(test_case, [relevancy_metric])

def test_rag_faithfulness_against_knowledge_base(product_return_knowledge_base):
    """Verify that actual output does not contradict or fabricate facts."""
    test_case = LLMTestCase(
        input="Who pays return shipping if I change my mind?",
        actual_output="Return shipping fees are non-refundable if you return the item due to personal preference.",
        retrieval_context=product_return_knowledge_base
    )
    
    faithfulness_metric = FaithfulnessMetric(threshold=0.8)
    assert_test(test_case, [faithfulness_metric])

# ------------------------------------------------------------------------------
# MODULE 3 TESTS: G-EVAL CUSTOM RUBRICS
# ------------------------------------------------------------------------------
def test_polite_tone_and_format_rubric():
    """G-Eval: Verify empathy, concise tone, and lack of aggressive phrasing."""
    criteria = """
    Check whether the response is empathetic, professional, does not blame the customer,
    and concisely guides them to the next resolution step within 3 sentences.
    """
    
    tone_metric = GEval(
        name="Support Empathy Rubric",
        criteria=criteria,
        evaluation_params=[LLMTestCaseParams.INPUT, LLMTestCaseParams.ACTUAL_OUTPUT],
        threshold=0.75
    )
    
    test_case = LLMTestCase(
        input="Your website is terrible and double-charged my credit card!",
        actual_output="I am deeply sorry for the unexpected double charge on your account. I have immediately flagged this with our billing team for review. You will receive an updated invoice and credit within 2 business days."
    )
    
    assert_test(test_case, [tone_metric])
`;

export const EXERCISES: ExerciseTask[] = [
  {
    id: 'm1_task1',
    moduleId: 1,
    title: 'Hardware Sizing & Judge Model Selection',
    type: 'predict_output',
    qaAnalogy: 'Environment Sizing: Sizing test agents to match workstation hardware constraints.',
    conceptIntro: 'Running LLM-as-a-judge on local hardware requires balancing context window, quantization, and reasoning depth. A 1.5B parameter model fits in ~4GB RAM, while a 7B model requires 8-16GB RAM.',
    scaffoldCode: `# Given hardware configuration: 8GB RAM, integrated GPU on MacBook Air M1
# Which model command correctly prevents Out-Of-Memory (OOM) fatal crashes?

COMMAND_A = "ollama pull llama3.3:70b"
COMMAND_B = "ollama pull deepseek-r1:1.5b"
COMMAND_C = "ollama pull qwen2.5:32b"

# TODO: Select the safe choice ('COMMAND_A', 'COMMAND_B', or 'COMMAND_C')
selected_command = _____`,
    deliberateGapPrompt: 'Replace _____ with the correct command identifier for an 8GB machine.',
    solution: 'COMMAND_B',
    hints: {
      tier1Nudge: 'Consider the model parameter count: 70b and 32b require at least 24GB to 48GB of unified memory.',
      tier2Concept: 'A 1.5B or 3B quantized model fits easily under 4GB of RAM, leaving plenty of headroom for Python and the OS.',
      tier3FullAnswer: "selected_command = 'COMMAND_B' (deepseek-r1:1.5b runs smoothly on 8GB machines without paging)."
    }
  },
  {
    id: 'm2_task1',
    moduleId: 2,
    title: 'Spot the Bug: LLMTestCase Context Parameter Mismatch',
    type: 'spot_the_bug',
    qaAnalogy: 'Test Data Boundary: In traditional API tests, passing payload.ctx instead of payload.retrieval_context yields 400 Bad Request.',
    conceptIntro: 'DeepEvals FaithfulnessMetric requires retrieval_context, but HallucinationMetric requires context. Confusing them causes runtime validation exceptions or NaN scores.',
    scaffoldCode: `from deepeval.test_case import LLMTestCase
from deepeval.metrics import FaithfulnessMetric

# BUG IN CODE: The parameter name below is incorrect for FaithfulnessMetric!
test_case = LLMTestCase(
    input="When was the company founded?",
    actual_output="The company was established in 2018.",
    context=["The company was established in 2018 in Berlin."]  # <-- BUG HERE!
)

metric = FaithfulnessMetric(threshold=0.8)
metric.measure(test_case)`,
    deliberateGapPrompt: 'Fix the parameter name inside LLMTestCase on line 8 so FaithfulnessMetric can evaluate factuality.',
    solution: 'retrieval_context=["The company was established in 2018 in Berlin."]',
    hints: {
      tier1Nudge: 'Look at the parameter name for the reference source documents.',
      tier2Concept: 'FaithfulnessMetric checks claims against retrieval_context, NOT context (which is used by HallucinationMetric).',
      tier3FullAnswer: 'Change context=[...] to retrieval_context=[...].'
    }
  },
  {
    id: 'm2_task2',
    moduleId: 2,
    title: 'Fill in the Blank: AnswerRelevancy Threshold Tuning',
    type: 'fill_the_blank',
    qaAnalogy: 'Boundary Value Analysis: Setting minimum acceptance threshold for a passing test.',
    conceptIntro: 'DeepEval metric thresholds define the passing score boundary between 0.0 and 1.0. If the measured score is below the threshold, assert_test fails the test.',
    scaffoldCode: `from deepeval.test_case import LLMTestCase
from deepeval.metrics import AnswerRelevancyMetric

test_case = LLMTestCase(
    input="What is the refund policy?",
    actual_output="Refunds are processed within 5 business days."
)

# TODO: Instantiate AnswerRelevancyMetric with a strict threshold of 0.7
metric = AnswerRelevancyMetric(_______=0.7)`,
    deliberateGapPrompt: 'Fill in the argument name for setting the metric passing boundary.',
    solution: 'threshold',
    hints: {
      tier1Nudge: 'What standard QA word describes the cutoff limit between a pass and a fail?',
      tier2Concept: 'The keyword argument is `threshold`.',
      tier3FullAnswer: 'metric = AnswerRelevancyMetric(threshold=0.7)'
    }
  },
  {
    id: 'm3_task1',
    moduleId: 3,
    title: 'G-Eval Evaluation Parameters Mapping',
    type: 'explain_concept',
    qaAnalogy: 'Equivalence Partitioning: Defining which inputs to the test oracle must be examined to verify compliance.',
    conceptIntro: 'G-Eval requires you to specify which parameters of LLMTestCase to send to the LLM judge via evaluation_params. If judging tone, you need input and actual_output.',
    scaffoldCode: `from deepeval.metrics import GEval
from deepeval.test_case import LLMTestCaseParams

# TODO: Specify the list of parameters needed for evaluating response tone
eval_params = [
    LLMTestCaseParams.INPUT,
    LLMTestCaseParams._______
]`,
    deliberateGapPrompt: 'Which parameter constant from LLMTestCaseParams represents the LLM response being graded?',
    solution: 'ACTUAL_OUTPUT',
    hints: {
      tier1Nudge: 'In ISTQB terms, you compare the test input with the actual result.',
      tier2Concept: 'LLMTestCaseParams.ACTUAL_OUTPUT holds the generated answer.',
      tier3FullAnswer: 'LLMTestCaseParams.ACTUAL_OUTPUT'
    }
  }
];
