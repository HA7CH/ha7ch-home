window.ANC_FAQ = [
  {
    "id": "what-is-anc",
    "category": "product",
    "en": {
      "q": "What is ANC?",
      "a": "ANC stands for AI Native Company. It is our approach to organizing a company around people and AI, and the shared operating foundation we build to support it. It connects persistent tasks, maintained business knowledge, reusable methods, and reviewable results. Each company configures its own instance and connected services."
    },
    "zh": {
      "q": "ANC 是什么？",
      "a": "ANC = AI Native Company，AI 原生企业。它代表围绕人与 AI 重新组织企业工作的理念，也是我们为此构建的共同工作基础。系统连接持续任务、经过维护的业务知识、可复用方法和可检查的结果，每家公司配置自己的实例与接入服务。"
    }
  },
  {
    "id": "ai-assistants",
    "category": "product",
    "en": {
      "q": "How is ANC different from a general-purpose AI assistant?",
      "a": "ANC focuses on what happens around a task: keeping its state, using the company’s current methods, accepting follow-up instructions, recovering from interruptions, and tracking delivery. It uses capable underlying models while maintaining company context separately."
    },
    "zh": {
      "q": "ANC 与通用 AI 助手有什么不同？",
      "a": "ANC 重点处理任务周围的企业要求：保留状态、使用公司的当前方法、接收补充要求、从中断恢复，并记录交付。它使用底层模型，同时独立维护企业上下文。"
    }
  },
  {
    "id": "human-on-the-loop",
    "category": "people",
    "en": {
      "q": "What does “Human on the Loop” mean?",
      "a": "People set goals and boundaries, then let ANC advance the work. They can inspect, redirect, and review it. Additional authority and business judgments remain explicit decisions. The intended degree of autonomy is configured for the task and deployment."
    },
    "zh": {
      "q": "Human on the Loop 是什么意思？",
      "a": "人设定目标和边界，让 ANC 推进工作，并能随时检查、调整和验收。新增权限与业务判断仍需要明确决策。自主程度取决于任务与部署配置。"
    }
  },
  {
    "id": "interruptions",
    "category": "product",
    "en": {
      "q": "What happens if a task is interrupted?",
      "a": "The runtime preserves task and execution records. Recovery checks prior progress and uncertain actions before continuing. A prepared result can be delivered without generating it again. A result whose delivery is uncertain is retained for reconciliation."
    },
    "zh": {
      "q": "工作中断后怎么办？",
      "a": "运行层保留任务和执行记录。恢复时先检查已有进展与状态不确定的动作，再继续工作。已准备好的成果可以继续交付，送达情况不明时保留记录等待核对。"
    }
  },
  {
    "id": "organizational-learning",
    "category": "product",
    "en": {
      "q": "Does ANC learn from our work?",
      "a": "Its learning approach is based on maintained knowledge and methods. Reviewed corrections can update those records, and completed projects can provide evidence for proposed improvements. This does not imply automatic model retraining or that every conversation becomes company truth."
    },
    "zh": {
      "q": "ANC 会从工作中学习吗？",
      "a": "ANC 通过维护知识和方法积累经验。经过确认的纠错可以更新这些记录，已完成项目也能为改进建议提供证据。这不代表自动训练模型，也不会把每段对话直接当作公司事实。"
    }
  },
  {
    "id": "employee-access",
    "category": "deployment",
    "en": {
      "q": "Can every employee see all company information?",
      "a": "Access depends on the configured identity, task ownership, sources, and connected tools. Shared processing does not automatically make all information shared. Each deployment’s access paths need to be configured and validated; ANC is not yet a universal permissions layer for every connected system."
    },
    "zh": {
      "q": "每个员工都能看到所有公司资料吗？",
      "a": "访问范围取决于身份、任务归属、资料来源和工具配置。共同处理信息不会自动让所有资料公开。每次部署都需要配置并核验相应访问路径；ANC 尚未统一覆盖所有外部系统的权限。"
    }
  },
  {
    "id": "hosting-and-data",
    "category": "deployment",
    "en": {
      "q": "Where does ANC run, and where does data go?",
      "a": "Current setups include a company-controlled Mac host and configured cloud services. Company knowledge is stored separately from model sessions. Model calls, storage, messaging, and other integrations determine which services process data. Local execution alone does not mean all processing is local."
    },
    "zh": {
      "q": "ANC 部署在哪里，数据会去哪里？",
      "a": "现有部署包括公司控制的 Mac 主机与配置的云服务。企业知识独立于模型会话保存。模型调用、存储、消息及其他接入决定哪些服务处理数据；本地执行不代表所有处理都在本地完成。"
    }
  },
  {
    "id": "model-choice",
    "category": "deployment",
    "en": {
      "q": "Can we use different AI models?",
      "a": "ANC is designed around stable company objects and replaceable execution adapters. Current deployments use Codex and Claude Code in different environments. Changing a provider still requires integration and validation; compatibility is not automatic."
    },
    "zh": {
      "q": "可以更换底层模型吗？",
      "a": "ANC 围绕稳定的企业对象与可替换的执行适配层设计。现有不同环境使用 Codex 或 Claude Code。更换提供方仍需要接入和验收，并非天然兼容所有模型。"
    }
  },
  {
    "id": "bean",
    "category": "product",
    "en": {
      "q": "What does Bean add?",
      "a": "Bean brings selected, authorized spoken context into the system. Its recording-to-transcript-to-private-chat flow has been demonstrated on a real device. It remains a development prototype, with further device reliability and multiuser rollout validation underway."
    },
    "zh": {
      "q": "Bean 硬件带来了什么？",
      "a": "Bean 把选定且经过授权的口头信息带入系统。真实设备已验证录音、转写与私聊交付链路。目前仍是开发原型，设备可靠性和多人部署仍在继续验收。"
    }
  },
  {
    "id": "dojo",
    "category": "people",
    "en": {
      "q": "What is Dojo for?",
      "a": "Dojo helps employees work with ANC and practice directing and evaluating AI. Its live work interface reuses ANC’s task system. Much of the training experience is still demonstrative; the full connection from reviewed work to training and onboarding is being developed."
    },
    "zh": {
      "q": "Dojo 的作用是什么？",
      "a": "Dojo 帮助员工使用 ANC，并练习指挥和评估 AI。真实工作界面复用 ANC 的任务系统。训练部分仍有较多演示实现，已验收工作到训练和新人培养的完整连接正在开发。"
    }
  },
  {
    "id": "employee-contributions",
    "category": "people",
    "en": {
      "q": "How do employees benefit and receive recognition?",
      "a": "Employees can contribute by defining better tasks, evaluating results, resolving exceptions, and improving reusable methods. We are developing ways to attribute these contributions to reviewed work. Task counts alone are not a reliable measure of value, and employment policies remain the company’s decision."
    },
    "zh": {
      "q": "员工如何受益，贡献如何被认可？",
      "a": "员工可以通过定义任务、判断结果、处理异常和改进方法创造价值。我们正在开发依据真实工作证据记录这些贡献的能力。任务数量本身不能可靠代表价值，人员与激励制度仍由企业决定。"
    }
  },
  {
    "id": "pricing",
    "category": "deployment",
    "en": {
      "q": "How do deployment and pricing work?",
      "a": "Deployment is assisted today. We begin with a bounded workflow and agree on the required setup and integrations. Current engagements include deployment, assessment, and training. Our planned software model is an annual ANC contract with separate setup and integration fees; pricing depends on scope."
    },
    "zh": {
      "q": "如何部署与收费？",
      "a": "目前采用协助部署方式，从边界清晰的工作场景开始，确定配置与接入范围。现有服务包括部署、评估和培训。软件商业模式计划采用年度 ANC 合同，并单独收取配置与接入费用；具体价格取决于范围。"
    }
  },
  {
    "id": "self-serve-rollout",
    "category": "deployment",
    "en": {
      "q": "Is ANC ready for a self-serve rollout?",
      "a": "ANC currently requires assisted deployment. Reusable runtime code and setup tooling are available, but each new environment still needs account configuration, integration checks, and a real task completed and delivered to its intended user. A successful installation alone does not establish readiness for a company-wide rollout."
    },
    "zh": {
      "q": "ANC 已经可以自助部署到全公司了吗？",
      "a": "ANC 目前仍需要协助部署。可复用的执行代码与配置工具已经具备，但新环境仍需完成账号配置、接入检查，并验证真实任务能够执行和交付给正确的人。安装成功本身，不代表已经具备全公司推广条件。"
    }
  }
];
