/* The curriculum. Edit freely — the UI renders whatever is in here.
   Shape: stage { no, t, wk, hrs, sub, out, g:[ group { t, i:[ item { n, w?, m? } ] } ] }
     n = name   w = why it matters   m = true marks a milestone
*/
export const ROADMAP = [
{no:"00", t:"Toolbelt", wk:"Weeks 1–6", hrs:"~100 h",
 sub:"You cannot learn machine learning and programming simultaneously. Get fluent enough that code stops being the obstacle.",
 out:"You can write a 200-line Python program, read a traceback without panic, push it to GitHub, and do linear algebra numerically in NumPy without loops.",
 g:[
  {t:"Python as a language", i:[
   {n:"Syntax, types, control flow, functions", w:"Variables, conditionals, loops, arguments, return values, scope."},
   {n:"Data structures: list, dict, set, tuple", w:"Know the cost of each operation. Dicts are the workhorse of Python."},
   {n:"Comprehensions and unpacking", w:"You will read code written entirely in comprehensions."},
   {n:"Classes, inheritance, dunder methods", w:"nn.Module is a class. __call__ and __init__ appear everywhere in PyTorch."},
   {n:"Iterators, generators, yield", w:"DataLoaders are generators. Lazy evaluation matters at scale."},
   {n:"Decorators and context managers", w:"@torch.no_grad() and `with autocast()` are both of these."},
   {n:"Type hints and dataclasses", w:"Config objects in every serious repo."},
   {n:"Exceptions, debugging with pdb, logging", w:"Learn breakpoint() now; it saves hundreds of hours later."}
  ]},
  {t:"Environment and tooling", i:[
   {n:"Linux shell: paths, pipes, grep, find, ssh", w:"All GPU work happens over ssh into a Linux box."},
   {n:"tmux or screen", w:"So a dropped connection doesn't kill a 6-hour training run."},
   {n:"Git: commit, branch, merge, rebase, remotes", w:"Version your experiments from day one."},
   {n:"GitHub: PRs, issues, reading other people's repos", w:"Reading code is 60% of learning ML."},
   {n:"Virtual environments: venv, uv, conda", w:"Dependency hell is real and CUDA versions make it worse."},
   {n:"Jupyter vs scripts — when to use which", w:"Explore in notebooks, train in scripts. Never train in a notebook."},
   {n:"Docker basics: images, containers, volumes", w:"How you'll ship anything in stage 8."}
  ]},
  {t:"Scientific Python", i:[
   {n:"NumPy ndarray: shape, dtype, indexing, slicing", w:"The mental model behind every tensor library."},
   {n:"Broadcasting rules", w:"Learn these cold. Half of all deep-learning bugs are silent broadcasts."},
   {n:"Vectorisation — replacing loops with array ops", w:"100× speedups, and it's how GPUs think."},
   {n:"Axis semantics and reductions", w:"sum(axis=-1) vs sum(axis=0) is the difference between a working and broken softmax."},
   {n:"Views vs copies, memory layout, strides", w:"Explains .contiguous() errors you'll hit in PyTorch."},
   {n:"einsum and einops notation", w:"Makes attention code readable instead of a permute soup."},
   {n:"Pandas: DataFrame, groupby, merge, missing data", w:"For stage 2 and all data inspection."},
   {n:"Matplotlib: figures, axes, plotting a loss curve", w:"You will stare at loss curves for the next 18 months."},
   {n:"Implement k-NN and linear regression in pure NumPy", m:true, w:"No scikit-learn. Fit a real dataset, plot the fit, compute the error yourself."}
  ]}
]},

{no:"01", t:"Mathematics", wk:"Weeks 4–18 · parallel", hrs:"~180 h",
 sub:"Working fluency, not proofs. Every item here is used directly later — if you can't see where it's used, ask before you study it.",
 out:"You can derive a gradient by hand, read the maths in a paper without skipping it, and explain why cross-entropy is the loss.",
 g:[
  {t:"Linear algebra", i:[
   {n:"Vectors, dot product, norms, projection", w:"Cosine similarity in stage 7 is just a normalised dot product."},
   {n:"Matrices as linear maps, not grids of numbers", w:"The single most important conceptual shift. Watch 3Blue1Brown."},
   {n:"Matrix multiplication and its cost", w:"O(n³) naive. Everything about GPU efficiency follows from this."},
   {n:"Rank, span, basis, null space", w:"Rank is what 'low-rank adaptation' in LoRA means."},
   {n:"Inverse, pseudo-inverse, solving linear systems", w:"The normal equations for linear regression."},
   {n:"Eigenvalues and eigenvectors", w:"PCA, stability analysis, why gradients explode."},
   {n:"Singular value decomposition", w:"PCA, low-rank approximation, and the direct justification for LoRA."},
   {n:"Positive semi-definite matrices, quadratic forms", w:"Covariance matrices, second-order optimisation."},
   {n:"Matrix calculus: Jacobians, gradient shapes", w:"Backprop is the chain rule over Jacobians. Learn the layout conventions."}
  ]},
  {t:"Calculus and optimisation", i:[
   {n:"Derivatives, partial derivatives, gradients", w:"The gradient points uphill; you go the other way. That's training."},
   {n:"The chain rule, deeply", w:"Backpropagation is the chain rule and nothing else."},
   {n:"Hessians, Taylor expansion, convexity", w:"Why learning rates have a ceiling; why loss landscapes have shape."},
   {n:"Gradient descent, SGD, mini-batching", w:"Batch size trades gradient noise against hardware efficiency."},
   {n:"Momentum and Nesterov acceleration", w:"Why optimisers have state."},
   {n:"AdaGrad → RMSProp → Adam → AdamW", w:"AdamW is what you'll use. Know why decoupled weight decay mattered."},
   {n:"LR schedules: warmup, cosine decay, one-cycle", w:"Warmup exists because early Adam updates are wildly mis-scaled."},
   {n:"Numerical stability: log-sum-exp, catastrophic cancellation", w:"Why softmax subtracts the max. Why you'll see NaN."},
   {n:"Floating point: fp32, tf32, fp16, bf16, fp8", w:"Range vs precision. bf16 exists because fp16 overflows in training."}
  ]},
  {t:"Probability and statistics", i:[
   {n:"Conditional probability and Bayes' rule", w:"The frame for every generative model."},
   {n:"Random variables, expectation, variance, covariance", w:"Initialisation schemes are variance arguments."},
   {n:"Bernoulli, categorical, Gaussian, Poisson", w:"A language model's output is a categorical distribution over the vocabulary."},
   {n:"Law of large numbers, central limit theorem", w:"Why mini-batch gradients work at all."},
   {n:"Maximum likelihood estimation and MAP", w:"Training a neural net is MLE. This is the deepest single idea in stage 1."},
   {n:"Bias, variance, estimators, sampling distributions", w:"Underpins the bias–variance decomposition in stage 2."},
   {n:"Hypothesis testing, confidence intervals, p-values", w:"So you don't report a 0.3% benchmark gain as a result."},
   {n:"Sampling: inverse transform, rejection, Gumbel-max", w:"Gumbel-max is how you sample from a softmax cheaply."}
  ]},
  {t:"Information theory", i:[
   {n:"Entropy as expected surprise", w:"Bits needed to encode a distribution."},
   {n:"Cross-entropy and why it is the loss", w:"The coding interpretation makes the loss function obvious rather than arbitrary."},
   {n:"KL divergence and its asymmetry", w:"The KL penalty is the safety rail of the whole RLHF pipeline."},
   {n:"Perplexity = exp(cross-entropy)", w:"The number you'll watch during pretraining."},
   {n:"Mutual information (survey)", w:"Appears in representation learning and interpretability."}
  ]},
  {t:"Discrete maths and complexity", i:[
   {n:"Big-O; the cost of matmul and attention", w:"Attention is O(n²·d) in sequence length. That single fact drives stage 5."},
   {n:"Graphs and DAGs", w:"A computation graph is a DAG. Autograd is a topological sort."},
   {n:"Dynamic programming", w:"Beam search and Viterbi."},
   {n:"Derive and implement the softmax + cross-entropy gradient by hand", m:true, w:"On paper, then in NumPy, then verify with a finite-difference gradient checker you also write. This is the gate to stage 3."}
  ]}
]},

{no:"02", t:"Classical machine learning", wk:"Weeks 12–26 · parallel", hrs:"~150 h",
 sub:"Skipping this is the classic mistake. Every idea that governs deep learning — overfitting, regularisation, evaluation — is clearer on models small enough to see through.",
 out:"You can take a raw tabular dataset to a validated, tuned, honestly-evaluated model and explain every choice you made.",
 g:[
  {t:"How learning problems are framed", i:[
   {n:"Supervised, unsupervised, self-supervised, reinforcement", w:"Language modelling is self-supervised. Know why that's the unlock."},
   {n:"Train / validation / test, and data leakage", w:"Leakage is the number-one cause of results that don't reproduce."},
   {n:"Cross-validation and its variants", w:"K-fold, stratified, grouped, time-series splits."},
   {n:"Bias–variance tradeoff", w:"The organising idea of the whole stage."},
   {n:"Overfitting, underfitting, model capacity", w:"And why enormous models overfit less than the theory predicted."},
   {n:"Double descent", w:"The classical curve is wrong for over-parameterised models. Knowing this prevents confusion in stage 3."},
   {n:"Regularisation: L1, L2, elastic net", w:"L2 is weight decay, which you'll set on every model you ever train."}
  ]},
  {t:"Evaluation", i:[
   {n:"Accuracy, precision, recall, F1", w:"And why accuracy lies on imbalanced data."},
   {n:"ROC-AUC vs PR-AUC", w:"PR-AUC when positives are rare."},
   {n:"Confusion matrices and error analysis", w:"Look at the actual mistakes. Always."},
   {n:"Calibration and reliability diagrams", w:"A confident wrong model is worse than an uncertain one."},
   {n:"Loss functions: MSE, MAE, Huber, cross-entropy, hinge", w:"The loss encodes what you actually want."},
   {n:"Baselines — always build the dumb one first", w:"If you can't beat predicting the mean, your pipeline is broken."}
  ]},
  {t:"Algorithms — implement each from scratch, then use sklearn", i:[
   {n:"Linear regression: normal equations and gradient descent", w:"Both. Compare them."},
   {n:"Logistic and softmax regression", w:"Softmax regression is literally the output layer of every classifier you'll build later."},
   {n:"k-nearest neighbours", w:"No training, all inference. A useful contrast."},
   {n:"Naive Bayes", w:"Still a real baseline for text."},
   {n:"Decision trees: entropy, Gini, splitting", w:"Interpretable, and the basis of the next item."},
   {n:"Bagging, random forests", w:"Variance reduction by averaging."},
   {n:"Gradient boosting: XGBoost, LightGBM", w:"Still beats deep learning on most tabular data. Know that, and say it out loud."},
   {n:"SVMs and the kernel trick", w:"Margins, and how to get non-linearity without depth."},
   {n:"k-means and hierarchical clustering", w:"Vector clustering returns in stage 7 retrieval."},
   {n:"PCA, t-SNE, UMAP", w:"PCA is SVD. t-SNE/UMAP are how you'll look at embeddings."},
   {n:"Gaussian mixtures and expectation-maximisation", w:"Latent variables, which is the doorway to generative modelling."}
  ]},
  {t:"Practical craft", i:[
   {n:"Feature engineering, scaling, categorical encoding", w:"Where most tabular performance actually comes from."},
   {n:"Imbalanced data: resampling, class weights, thresholds", w:"Real datasets are never balanced."},
   {n:"Hyperparameter search: grid, random, Bayesian (Optuna)", w:"Random beats grid. Know why."},
   {n:"scikit-learn pipelines and transformers", w:"Prevents leakage structurally."},
   {n:"Experiment tracking: Weights &amp; Biases or MLflow", w:"Start now. In stage 4 you will have 60 runs and no memory of them."},
   {n:"End-to-end tabular project with a written post-mortem", m:true, w:"Pick a Kaggle dataset, beat a strong baseline, and write up what worked, what didn't, and what you'd do next. The write-up is the deliverable."}
  ]}
]},

{no:"03", t:"Deep learning foundations", wk:"Weeks 22–38", hrs:"~200 h",
 sub:"The stage where you stop being a library user. You will write your own automatic differentiation engine, and after that nothing in PyTorch is magic.",
 out:"You've built an autograd engine from nothing, trained MNIST with it, and separately trained a ResNet to >93% on CIFAR-10 with your own PyTorch training loop.",
 g:[
  {t:"Neural network fundamentals", i:[
   {n:"Perceptron → multilayer perceptron", w:"And why a single linear layer can never solve XOR."},
   {n:"Universal approximation — and its uselessness in practice", w:"Existence proofs say nothing about learnability."},
   {n:"Activations: sigmoid, tanh, ReLU, GELU, SiLU", w:"Modern transformers use GELU or SiLU. Know what changed and why."},
   {n:"Forward pass as function composition", w:"A network is f(g(h(x))). Nothing more."},
   {n:"Backpropagation derived by hand for a 2-layer net", w:"Do this on paper before writing any autograd code."},
   {n:"Initialisation: Xavier/Glorot, He, and variance scaling", w:"Bad init is why a network silently fails to learn."},
   {n:"Vanishing and exploding gradients", w:"The problem residual connections and normalisation were invented to solve."}
  ]},
  {t:"Build your own autograd engine", i:[
   {n:"Computation graphs and reverse-mode AD", w:"Why reverse mode, not forward mode, for scalar losses."},
   {n:"A scalar Value class with backward()", w:"Karpathy's micrograd. ~150 lines that explain PyTorch entirely."},
   {n:"Extend it to tensors with broadcasting backward", w:"The hard part: a broadcast forward is a sum backward."},
   {n:"Implement Linear, ReLU, softmax, cross-entropy", w:"Your own nn.Module hierarchy."},
   {n:"Implement SGD, momentum, and Adam", w:"Now you know exactly what optimizer.step() does."},
   {n:"Train MNIST to >97% with zero frameworks", m:true, w:"Your engine, your layers, your optimiser, your training loop. The most important milestone on this roadmap."}
  ]},
  {t:"Making deep networks train", i:[
   {n:"BatchNorm, LayerNorm, RMSNorm, GroupNorm", w:"LLMs use RMSNorm. Know why BatchNorm fails on sequences."},
   {n:"Residual connections and the residual stream", w:"Gradients get a highway. This is why depth became possible."},
   {n:"Dropout, weight decay, label smoothing, early stopping", w:"Deep-learning regularisation, mapped to stage 2 concepts."},
   {n:"Gradient clipping", w:"By norm. You'll need it in every LLM run."},
   {n:"Data augmentation", w:"The cheapest regularisation there is."},
   {n:"Debugging: overfit one batch, watch gradient norms, hunt NaN", w:"A systematic debugging protocol is worth more than any architecture knowledge."},
   {n:"Learning-rate finding and sensible defaults", w:"LR is the hyperparameter that matters most, by a wide margin."}
  ]},
  {t:"PyTorch, properly", i:[
   {n:"Tensors, autograd, .backward(), no_grad", w:"Now trivially familiar because you built it."},
   {n:"nn.Module: parameters, buffers, state_dict", w:"The distinction between parameters and buffers matters at checkpoint time."},
   {n:"Dataset, DataLoader, collate_fn, num_workers", w:"Input pipelines are the usual hidden bottleneck."},
   {n:"Optimisers, schedulers, parameter groups", w:"Different LRs for different layers."},
   {n:"Devices, .to(), pinned memory, non_blocking", w:"Where your time actually goes."},
   {n:"Mixed precision: autocast, GradScaler, bf16", w:"Roughly 2× speed and half the memory. Non-optional on consumer GPUs."},
   {n:"torch.compile and its failure modes", w:"Free speedup, occasional obscure graph breaks."},
   {n:"Checkpointing, resuming, seeding, reproducibility", w:"You will lose a run to a crash. Plan for it."},
   {n:"Profiling: torch.profiler, memory snapshots", w:"Measure before optimising. Always."}
  ]},
  {t:"Architectures before transformers", i:[
   {n:"Convolution: kernels, stride, padding, receptive field", w:"Still everywhere in vision encoders for multimodal models."},
   {n:"Pooling, and the fully-convolutional idea", w:"Translation equivariance as an inductive bias."},
   {n:"LeNet → AlexNet → VGG → ResNet", w:"Read the four papers in order. It's the clearest arc in the field."},
   {n:"RNNs, LSTMs, GRUs, backprop through time", w:"You need to feel why sequential recurrence is fatally slow on GPUs."},
   {n:"Seq2seq and Bahdanau attention", w:"Attention was invented here, as a fix for the RNN bottleneck. Essential context for stage 4."},
   {n:"Autoencoders, VAEs, GANs, diffusion (survey)", w:"Survey level now; you return to diffusion in stage 7."},
   {n:"Train ResNet on CIFAR-10 to >93% with your own loop", m:true, w:"No Lightning, no template repo. Augmentation, schedule, mixed precision, checkpointing — all yours."}
  ]}
]},

{no:"04", t:"Transformers and LLM internals", wk:"Weeks 36–52", hrs:"~230 h",
 sub:"The centre of the roadmap. Every component of a modern language model, built by hand, then assembled into something you pretrain yourself.",
 out:"You have written a decoder-only transformer from an empty file, pretrained it on real text, and can explain every tensor's shape at every step.",
 g:[
  {t:"Tokenisation", i:[
   {n:"Characters vs words vs subwords", w:"The tradeoff: vocabulary size against sequence length."},
   {n:"Byte-pair encoding, implemented from scratch", w:"Train merges on a corpus yourself. It's ~200 lines and demystifies the whole input side."},
   {n:"WordPiece, Unigram, SentencePiece", w:"The alternatives and where each is used."},
   {n:"Byte-level BPE", w:"How GPT-family models guarantee they can encode any input."},
   {n:"Special tokens, BOS/EOS, padding, chat templates", w:"Getting the chat template wrong silently destroys fine-tuning results."},
   {n:"Tokeniser pathologies: numbers, code, non-English, spelling", w:"Why models miscount letters. Why non-English costs more tokens."}
  ]},
  {t:"Attention", i:[
   {n:"Query, key, value — the retrieval intuition", w:"Soft dictionary lookup, differentiable end to end."},
   {n:"Scaled dot-product attention, and why √d", w:"Without the scale, softmax saturates and gradients vanish. Derive it."},
   {n:"Multi-head attention", w:"Parallel subspaces. Watch the reshape and transpose carefully."},
   {n:"Causal masking", w:"The one line that separates a language model from a bidirectional encoder."},
   {n:"Padding masks and attention to nothing", w:"A classic source of silent NaN."},
   {n:"Complexity: O(n²·d), and what that costs you", w:"The constraint that shapes all long-context research."},
   {n:"The KV cache", w:"Why generation is memory-bandwidth-bound, not compute-bound."},
   {n:"MQA, GQA, sliding-window attention", w:"KV cache reduction. Every current open model uses GQA."},
   {n:"FlashAttention and IO-awareness", w:"Same maths, tiled to fit SRAM. The idea generalises to everything in stage 5."}
  ]},
  {t:"The transformer block", i:[
   {n:"Token embeddings and weight tying", w:"Input and output embeddings can share weights."},
   {n:"Positional encoding: sinusoidal, learned, ALiBi", w:"Attention is permutation-invariant; position must be injected."},
   {n:"RoPE — rotary position embeddings", w:"What essentially every modern model uses. Understand the rotation, not just the formula."},
   {n:"Feed-forward network, expansion ratio, SwiGLU", w:"Two-thirds of the parameters live here, which surprises everyone."},
   {n:"Pre-norm vs post-norm, and RMSNorm", w:"Pre-norm is why deep transformers train stably now."},
   {n:"The residual stream as a mental model", w:"Blocks read from and write to a shared bus. This framing carries into interpretability."},
   {n:"Decoder-only vs encoder-only vs encoder-decoder", w:"GPT vs BERT vs T5, and why decoder-only won."},
   {n:"Assemble a full GPT and count its parameters by hand", w:"Verify your count against the model. Off-by-a-factor errors are common."}
  ]},
  {t:"Pretraining a language model", i:[
   {n:"Next-token prediction as the objective", w:"One loss. Everything else emerges from it."},
   {n:"Pretraining corpora: FineWeb, The Pile, common sources", w:"Look at the actual data. Read 50 random documents from it."},
   {n:"Data cleaning: dedup, quality filtering, decontamination", w:"Data quality dominates architecture at every scale."},
   {n:"Sequence packing and context length", w:"Don't waste compute on padding."},
   {n:"Batch size, gradient accumulation, tokens-per-step", w:"How to simulate a large batch on one GPU."},
   {n:"LR schedule for LLMs: warmup + cosine, and the final LR", w:"Different in practice from vision training."},
   {n:"Watching loss and perplexity; spotting a diverging run early", w:"Kill bad runs in the first 5% of steps."},
   {n:"Scaling laws: Kaplan vs Chinchilla, compute-optimal tokens", w:"~20 tokens per parameter. This single number governs every training budget decision."},
   {n:"Hyperparameter transfer and muP (survey)", w:"Tune small, transfer big."}
  ]},
  {t:"Generation", i:[
   {n:"Greedy decoding and beam search", w:"And why beam search is wrong for open-ended text."},
   {n:"Temperature, top-k, top-p, min-p", w:"Sampling is where 'personality' actually comes from."},
   {n:"Repetition penalties and degeneration", w:"Why unconditioned models loop."},
   {n:"Speculative decoding", w:"A draft model proposes, the big model verifies. Nearly free speedup."},
   {n:"Constrained and structured decoding, grammars", w:"How to guarantee valid JSON. Used constantly in stage 7."},
   {n:"Pretrain a 10–50 M parameter GPT on your own GPU", m:true, w:"Your tokeniser, your model, your training loop, on TinyStories or a Wikipedia subset. It should produce grammatical, coherent short text. Then run karpathy/nanochat end to end (~$100 rented) to see the full pipeline at real scale."}
  ]}
]},

{no:"05", t:"Scaling and systems", wk:"Weeks 50–62", hrs:"~150 h",
 sub:"Where the difference between a hobbyist and an engineer lives. Models are trained by people who understand memory bandwidth.",
 out:"You can read a profiler trace, say whether a kernel is memory- or compute-bound, and make a training loop 2× faster on the same hardware.",
 g:[
  {t:"Hardware and performance", i:[
   {n:"GPU architecture: SMs, warps, tensor cores", w:"Why GPUs want large, regular, parallel work."},
   {n:"Memory hierarchy: HBM vs SRAM vs registers", w:"The entire reason FlashAttention exists."},
   {n:"Arithmetic intensity and the roofline model", w:"The one framework that tells you what to optimise."},
   {n:"Memory-bound vs compute-bound operations", w:"Attention at inference is memory-bound. Training matmuls are compute-bound."},
   {n:"Kernel fusion and why it helps", w:"Fewer round trips to HBM."},
   {n:"CUDA basics — write one simple kernel", w:"Once, so the abstraction stops being opaque."},
   {n:"Triton — write a fused kernel that beats eager PyTorch", w:"The practical path to custom kernels without full CUDA."},
   {n:"Read the FlashAttention paper as a systems case study", w:"The best single example of algorithm–hardware co-design in the field."}
  ]},
  {t:"Distributed training", i:[
   {n:"Data parallelism and DDP", w:"The default. Replicate the model, all-reduce the gradients."},
   {n:"Collective operations: all-reduce, all-gather, reduce-scatter", w:"NCCL primitives. Everything else is built from these."},
   {n:"ZeRO stages and FSDP", w:"Shard optimiser state, then gradients, then parameters. How 70 B models fit."},
   {n:"Tensor parallelism", w:"Split individual matmuls across GPUs."},
   {n:"Pipeline parallelism and bubbles", w:"Split layers across GPUs; micro-batches fill the gaps."},
   {n:"Sequence and context parallelism", w:"For very long contexts."},
   {n:"3D parallelism — combining all three", w:"How frontier training runs are actually configured."},
   {n:"Gradient checkpointing / activation recomputation", w:"Trade compute for memory. Often 40% more batch size."},
   {n:"Checkpointing, resumption, fault tolerance", w:"At scale, hardware failure is routine, not exceptional."}
  ]},
  {t:"Data at scale", i:[
   {n:"The crawl → filter → dedup → tokenise pipeline", w:"Trillions of tokens don't fit in RAM."},
   {n:"MinHash / LSH deduplication", w:"Duplicates cause memorisation and waste compute."},
   {n:"Quality classifiers and heuristic filters", w:"How FineWeb and friends are actually built."},
   {n:"PII removal and benchmark decontamination", w:"Contamination invalidates your evaluations silently."},
   {n:"Streaming datasets, sharding, binary token formats", w:"Read throughput becomes the bottleneck before compute does."},
   {n:"Data mixture ratios and curriculum", w:"How much code, how much web, how much maths — and when."}
  ]},
  {t:"Architectural efficiency", i:[
   {n:"Mixture-of-Experts: routing, load balancing, capacity", w:"Most parameters, a fraction of the FLOPs. Dominant in current frontier models."},
   {n:"Long context: RoPE scaling, YaRN, position interpolation", w:"How a 4k model becomes a 128k model."},
   {n:"Ring attention and sequence sharding", w:"Context beyond one device's memory."},
   {n:"State-space models: Mamba and hybrids", w:"Linear-time sequence modelling. The main live alternative to attention."},
   {n:"Profile your training loop and make it 2× faster", m:true, w:"Find the actual bottleneck with the profiler, fix it, measure again. Then rent a multi-GPU box for one day and run the same model under FSDP (~$30)."}
  ]}
]},

{no:"06", t:"Post-training and alignment", wk:"Weeks 58–70", hrs:"~150 h",
 sub:"A pretrained model completes text. Everything that makes it useful, steerable and safe happens here — and most of it fits on your GPU.",
 out:"You've taken an open base model to a fine-tuned, preference-optimised chat model on your own hardware, and measured that it actually improved.",
 g:[
  {t:"Supervised fine-tuning", i:[
   {n:"Instruction data: formats, sources, quality over quantity", w:"1,000 excellent examples beat 100,000 mediocre ones. Repeatedly demonstrated."},
   {n:"Chat templates and masking the prompt tokens", w:"Train on the completion, not the instruction. Get this wrong and results collapse."},
   {n:"Full fine-tuning vs parameter-efficient fine-tuning", w:"When each is appropriate."},
   {n:"LoRA: the ΔW = BA decomposition", w:"Your stage-1 SVD knowledge, applied directly. Train 0.1% of the parameters."},
   {n:"Rank, alpha, target modules — what to actually set", w:"The practical knobs, and how sensitive each one is."},
   {n:"QLoRA: 4-bit base, NF4, double quantisation", w:"This is what puts 14 B fine-tuning on a consumer GPU."},
   {n:"DoRA and other LoRA variants", w:"Incremental, worth knowing."},
   {n:"Catastrophic forgetting and how to detect it", w:"Your model got better at the task and worse at everything else."}
  ]},
  {t:"Reinforcement learning foundations", i:[
   {n:"MDPs: states, actions, rewards, policies, returns", w:"The vocabulary you need to read any RLHF paper."},
   {n:"Value functions and the Bellman equation", w:"The recursive structure at the heart of RL."},
   {n:"Policy gradients and REINFORCE", w:"Differentiating through sampling."},
   {n:"Advantage estimation and variance reduction", w:"Why baselines and GAE exist."},
   {n:"PPO: clipping, the objective, why it stabilises training", w:"The workhorse of RLHF for years."}
  ]},
  {t:"Preference optimisation", i:[
   {n:"The RLHF pipeline: SFT → reward model → PPO", w:"Read the InstructGPT paper closely. It's the blueprint."},
   {n:"Reward models: Bradley–Terry, pairwise preferences", w:"How human comparisons become a differentiable signal."},
   {n:"DPO — preference optimisation without a reward model", w:"Simpler, cheaper, and what you'll actually run on your GPU."},
   {n:"IPO, KTO, ORPO, SimPO", w:"The variants and what each fixes."},
   {n:"GRPO and RL for reasoning", w:"Group-relative advantages; the basis of recent reasoning models."},
   {n:"RLAIF and Constitutional AI", w:"AI feedback replacing human labels at scale."},
   {n:"Reward hacking and the KL penalty", w:"The model will exploit any flaw in your reward. Assume it."}
  ]},
  {t:"Reasoning and test-time compute", i:[
   {n:"Chain-of-thought and self-consistency", w:"Compute spent at inference buys accuracy."},
   {n:"Outcome vs process reward models", w:"Grading the answer vs grading each step."},
   {n:"Rejection sampling and STaR-style self-training", w:"Generate, filter by correctness, retrain on what worked."},
   {n:"Test-time scaling and long-thinking models", w:"The current frontier direction."},
   {n:"Distillation from a stronger model", w:"How small models become surprisingly capable."}
  ]},
  {t:"Alignment and safety", i:[
   {n:"Helpful, harmless, honest — and the tensions between them", w:"These genuinely conflict. Alignment is the tradeoff, not the removal of it."},
   {n:"Red-teaming, jailbreaks, prompt injection", w:"Prompt injection is the central unsolved security problem for agents."},
   {n:"Refusal calibration and over-refusal", w:"A model that refuses everything is also a failure."},
   {n:"Interpretability: probes, logit lens, activation patching", w:"Look inside your own model. It's more tractable than it sounds."},
   {n:"Sparse autoencoders and feature-level interpretability", w:"The most active current research direction here."},
   {n:"SFT then DPO a 1–3 B open model with QLoRA", m:true, w:"On your own GPU. Build a small preference dataset, run both stages, and evaluate before and after on a held-out set you wrote yourself. Publish the adapter."}
  ]}
]},

{no:"07", t:"Applied AI on top of models", wk:"Weeks 44–76 · parallel", hrs:"~160 h",
 sub:"Runs alongside stages 5 and 6 from week 44 — it needs only stage 4 knowledge, and it's where you'll build things people can actually use.",
 out:"You've shipped a retrieval-augmented agent with real evaluations, a cost budget, and a written analysis of where it fails.",
 g:[
  {t:"Prompting and context engineering", i:[
   {n:"Zero-shot, few-shot, system prompts", w:"Cheap, immediate leverage."},
   {n:"Structured output: JSON schema, function calling", w:"How models integrate with software rather than chat windows."},
   {n:"Context window budgeting and prompt caching", w:"Both a cost and a quality problem."},
   {n:"Context rot — why more context isn't always better", w:"Retrieval quality beats context quantity, consistently."}
  ]},
  {t:"Embeddings and retrieval", i:[
   {n:"Embedding models and the vector space view", w:"Your stage-2 clustering and stage-1 cosine similarity, applied."},
   {n:"Vector stores: FAISS, Qdrant, pgvector", w:"Start with pgvector unless you have a reason not to."},
   {n:"Approximate nearest neighbours: HNSW, IVF", w:"Exact search doesn't scale; know the recall tradeoff."},
   {n:"Chunking strategies and their failure modes", w:"The most under-rated determinant of RAG quality."},
   {n:"Hybrid search: BM25 + dense, and reranking", w:"Lexical search still wins on names, codes and rare terms."},
   {n:"RAG architecture end to end", w:"Ingest, embed, retrieve, rerank, generate, cite."},
   {n:"Evaluating RAG: groundedness, faithfulness, answer relevance", w:"Without evals you're just guessing whether changes helped."},
   {n:"Agentic and multi-hop retrieval, GraphRAG", w:"When one retrieval round isn't enough."}
  ]},
  {t:"Agents and tool use", i:[
   {n:"The tool-calling loop", w:"Model proposes a call, you execute it, you return the result. That's the whole mechanism."},
   {n:"ReAct, planning, reflection patterns", w:"And knowing when a plain loop beats an elaborate framework."},
   {n:"Model Context Protocol (MCP)", w:"The emerging standard for connecting tools to models."},
   {n:"Memory and state across turns", w:"Short-term context vs long-term store."},
   {n:"Multi-agent orchestration — and when it's overkill", w:"Usually overkill. Know the cases where it isn't."},
   {n:"Sandboxing, permissions, guardrails", w:"An agent with shell access is a security surface."},
   {n:"Evaluating agents: task success, trajectory, cost, latency", w:"Agents fail in ways single-turn evals never catch."}
  ]},
  {t:"Multimodal", i:[
   {n:"Vision transformers and CLIP-style contrastive training", w:"How images enter a shared representation space."},
   {n:"Vision-language models: projecting image tokens into an LLM", w:"Simpler than it looks — usually a small adapter."},
   {n:"Speech: Whisper-style ASR, TTS pipelines", w:"Audio in and out."},
   {n:"Diffusion models: forward and reverse process", w:"The generative story that isn't autoregressive."},
   {n:"Latent diffusion and flow matching", w:"How image generation became fast enough to be practical."},
   {n:"Ship a RAG agent with evals and a cost budget", m:true, w:"Real documents, real users if possible, a written eval set of at least 50 cases, measured cost per query, and an honest failure analysis."}
  ]}
]},

{no:"08", t:"Inference, deployment and MLOps", wk:"Weeks 68–78", hrs:"~110 h",
 sub:"A model that only runs in your notebook isn't finished. This stage is also, bluntly, the most employable part of the roadmap.",
 out:"Your own fine-tuned model is served behind an API with measured throughput, latency and cost per million tokens.",
 g:[
  {t:"Efficient inference", i:[
   {n:"Prefill vs decode — two different bottlenecks", w:"Prefill is compute-bound, decode is memory-bound. Everything follows."},
   {n:"KV cache memory maths", w:"Compute it for your own model. It's often larger than the weights."},
   {n:"PagedAttention and KV cache management", w:"vLLM's core idea, borrowed from OS virtual memory."},
   {n:"Continuous batching", w:"The single biggest throughput win in serving."},
   {n:"Quantisation: GPTQ, AWQ, GGUF, bitsandbytes", w:"int4 with minimal quality loss. How 32 B runs on 24 GB."},
   {n:"Pruning and distillation", w:"The other two compression levers."},
   {n:"Serving stacks: vLLM, SGLang, TensorRT-LLM, llama.cpp", w:"Know which to reach for and why."},
   {n:"Benchmarking: TTFT, TPOT, throughput, cost per M tokens", w:"Report these four numbers or you haven't measured anything."}
  ]},
  {t:"Productionising", i:[
   {n:"FastAPI, streaming responses, SSE", w:"Streaming is a UX requirement, not a nicety."},
   {n:"Containers, GPU scheduling, autoscaling", w:"GPUs are expensive and idle GPUs are pure loss."},
   {n:"Observability: structured logs, tracing, token accounting", w:"You cannot debug a model you cannot see."},
   {n:"Caching, rate limiting, retries, graceful fallback", w:"Ordinary systems engineering — and it's where most incidents come from."},
   {n:"Cost modelling per request", w:"Know the unit economics before you launch anything."}
  ]},
  {t:"MLOps", i:[
   {n:"Versioning data, models and configs", w:"An experiment you can't reproduce isn't a result."},
   {n:"Model registry, staged rollout, rollback", w:"Treat model deploys like code deploys."},
   {n:"CI/CD with automated evals as a gate", w:"Block the deploy if the eval regresses."},
   {n:"Drift detection and feedback loops", w:"Production distributions move away from your training data."},
   {n:"Model cards and documentation", w:"What the model is for, and what it isn't."},
   {n:"Serve your fine-tuned model with vLLM behind an API", m:true, w:"Containerised, streaming, with logging and a published benchmark of TTFT, throughput and cost per million tokens."}
  ]}
]},

{no:"09", t:"Evaluation and research practice", wk:"Weeks 30–82 · ongoing", hrs:"~120 h",
 sub:"Starts at week 30 and never stops. This is what turns a person who follows tutorials into someone who can extend the field.",
 out:"You can read a new paper the week it appears, judge whether its claims hold, reproduce the core result, and write up your own work credibly.",
 g:[
  {t:"Evaluation", i:[
   {n:"The standard benchmarks and what each measures", w:"MMLU, GSM8K, HumanEval, GPQA, MT-Bench, SWE-bench."},
   {n:"Why benchmark numbers mislead", w:"Contamination, prompt sensitivity, cherry-picked settings, saturation."},
   {n:"LLM-as-judge: pairwise comparison and its biases", w:"Position bias, length bias, self-preference. Control for all three."},
   {n:"Elo and arena-style evaluation", w:"Relative ranking from pairwise human votes."},
   {n:"Building a task-specific eval set", w:"The highest-leverage 200 lines you will write on any applied project."},
   {n:"Statistical significance, seeds and error bars", w:"One run is an anecdote. Report variance."},
   {n:"Human evaluation design", w:"Annotator agreement, instructions, and the cost of doing it properly."}
  ]},
  {t:"Reading and reproducing research", i:[
   {n:"The three-pass method for reading a paper", w:"Skim, grasp, reimplement. Don't read linearly."},
   {n:"Following arXiv without drowning", w:"Skim titles daily, read one paper properly per week."},
   {n:"Reproducing a paper end to end", w:"The fastest way to discover what papers leave out."},
   {n:"Ablation discipline", w:"Change one thing. Most claimed improvements evaporate under ablation."},
   {n:"The conference cycle: NeurIPS, ICML, ICLR, ACL", w:"Where the field talks to itself."}
  ]},
  {t:"The canon — read all of these", i:[
   {n:"Attention Is All You Need (2017)", w:"Read it after implementing a transformer, not before. It'll finally make sense."},
   {n:"GPT-2, GPT-3, and InstructGPT", w:"Scale, few-shot learning, and the birth of RLHF."},
   {n:"BERT and T5", w:"The paths not taken, and why."},
   {n:"Scaling Laws and Chinchilla", w:"The two papers that determine how every training budget is spent."},
   {n:"LoRA, FlashAttention, RoPE, GQA", w:"The four techniques in essentially every model you'll touch."},
   {n:"Switch Transformer and Mixtral", w:"Mixture-of-experts, in theory and in practice."},
   {n:"PPO, DPO, Constitutional AI", w:"The alignment toolkit."},
   {n:"Llama and DeepSeek technical reports", w:"The most detailed public accounts of building a real model."}
  ]},
  {t:"Contributing", i:[
   {n:"Contribute to an open-source ML project", w:"Start with documentation or a failing test. Read more than you write."},
   {n:"Write up your work publicly", w:"A clear blog post is worth more than a private notebook, every time."},
   {n:"Release models and datasets on Hugging Face", w:"With a model card that states limitations honestly."},
   {n:"Capstone: your own model, start to finish", m:true, w:"Choose a domain nobody has served well. Curate the data, pretrain a small base model from scratch, fine-tune and align it, evaluate it against a real baseline, serve it, and write the technical report. This is the whole roadmap in one project."}
  ]}
]}
];
