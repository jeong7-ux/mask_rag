# 코로나19 마스크 착용 방역지침 RAG AI (서버리스 프록시 v9.2)

질병관리청 및 지방자치단체의 **[마스크 착용 방역지침 준수 명령 및 과태료 부과 업무 안내서(제9판)]** 공식 공공문서를 기반으로 구축된 고도화된 AI 질의응답(RAG) 시스템입니다.

공식 지침서 전문을 계층형·의미론적(Parent-Child & Semantic Chunking) 구조로 분할하여 **Supabase Vector DB**(`pgvector`)에 적재하였으며, **OpenRouter / OpenAI API** 및 **Supabase Edge Functions** 서버리스 프록시를 연동하여 법적 근거, 과태료 부과 기준, 예외 대상 등을 정확하게 답변하고 원본 PDF 조항을 즉시 대조할 수 있도록 지원합니다.

---

## 📌 배포 서비스 (Live Demo)

- **🌐 웹 서비스 접속 Link**: [https://jeong7-ux.github.io/mask_rag/](https://jeong7-ux.github.io/mask_rag/)
- **🐙 GitHub Repository**: [https://github.com/jeong7-ux/mask_rag](https://github.com/jeong7-ux/mask_rag)

---

## ✨ 핵심 기능 및 RAG 아키텍처

### 1. 3가지 고도화된 RAG 모드 지원
- **🟢 Naive RAG**: 검색된 단편 조문 청크 본문만을 직관적으로 LLM에 전달하여 신속하게 답변을 도출합니다.
- **🔵 Advanced RAG (HyDE)**: 가설 질의 생성(Hypothetical Document Embeddings) 및 전문 행정 키워드 확장을 통해 사용자의 일상적인 질문을 공식 지침 법률 용어로 변환하여 검색 정밀도를 극대화합니다.
- **🟣 Modular RAG (Parent-Child Context Assembly)**: 벡터 검색은 450~700자 단위의 하위 청크(Child Chunk)로 정밀하게 수행하고, 답변 생성 시에는 해당 청크가 소속된 상위 문맥(Parent Context) 전체 단락을 자동 복원하여 LLM에 제공함으로써 문맥 단절 없는 완벽한 답변을 생성합니다.

### 2. 실시간 의미론적 적합도 평가 (Quality Metrics)
- 1,536차원 임베딩 코사인 내적값(Cosine Similarity)을 백분율 형태의 의미론적 적합도(Normalized Relevance Score)로 정규화 보정합니다.
- 검색 결과 상단에 **'✨ 최고 일치'**, **'👍 높은 일치'** 등의 직관적인 품질 배지와 선별 청크 평균 적합도를 실시간으로 시각화합니다.

### 3. 인터랙티브 원본 PDF 대조 뷰어
- 답변 하단에 생성되는 **근거 법조문 인용 버튼**(`📄 원본 p.OO 열기`) 클릭 시, 내장된 PDF 뷰어 모달이 실행됩니다.
- PDF 물리 페이지와 실제 문서 인쇄 페이지(목차, p.5 등) 간의 차이를 1:1 완벽하게 매핑하여 해당 조항 페이지로 즉시 이동합니다.
- 모바일/PC 환경을 고려한 상단바 숨김/표시 토글 및 새 창 열기 기능을 제공합니다.

### 4. 하이브리드 LLM 연동 및 서버리스 프록시 폴백
- 클라이언트에서 사용자의 OpenRouter API Key 또는 OpenAI API Key 입력을 지원합니다.
- API 키 미입력 시 또는 CORS/네트워크 제한 환경에서는 **Supabase Edge Functions**(`mask-ai`)를 통한 서버리스 프록시 모드로 자동 전환(Fallback)되어 중단 없는 서비스를 제공합니다.

---

## 🛠️ 기술 스택

| 구분 | 적용 기술 |
| :--- | :--- |
| **Frontend** | HTML5, Vanilla CSS3 (Modern Dark Glassmorphism Theme), JavaScript (ES6+), Font Awesome 6.4 |
| **Vector DB** | Supabase (`pgvector`, `match_documents_mask_guidelines` RPC) |
| **LLM & Embeddings** | OpenRouter API (`openai/gpt-4o-mini`), OpenAI API (`text-embedding-3-small`), Supabase Edge Functions (Deno) |
| **Hosting / Deploy** | GitHub Pages (`.nojekyll` 정적 배포 최적화) |

---

## 💡 웹 서비스 사용 방법

1. **페이지 접속**: [https://jeong7-ux.github.io/mask_rag/](https://jeong7-ux.github.io/mask_rag/) 링크를 통해 서비스에 접속합니다.
2. **API 자동 설정**: 서버리스 프록시 기본 모드로 동작합니다.
3. **RAG 모드 선택**: 화면 상단의 모드 바에서 `Naive`, `Advanced(HyDE)`, `Modular` 중 원하는 검색 방식을 선택합니다.
4. **질문 입력**: 질의창에 마스크 착용 의무, 과태료, 예외 규정 등 궁금한 내용을 자유롭게 입력합니다.
   - *예시 1*: "병원 일반 병실이나 대기실에서도 마스크를 의무적으로 써야 하나요?"
   - *예시 2*: "과태료 부과 예외 대상인 영유아의 정확한 연령 기준은 어떻게 되나요?"
   - *예시 3*: "망사형 마스크나 밸브형 마스크를 착용하면 과태료가 부과되나요?"
5. **원본 조항 검증**: 답변 하단의 '근거 법조문 및 공식 지침' 카드를 클릭하여 뷰어로 원본 내용을 직접 대조합니다.

---

## 📁 주요 파일 및 폴더 구조

```text
mask_rag/
  ├── index.html                   # 메인 웹 어플리케이션 UI (RAG 채팅, PDF 뷰어, 설정)
  ├── mask-guide.html              # 방역지침 업무 안내 및 보조 뷰어 페이지
  ├── mask_guidelines_v9.pdf       # 코로나19 마스크 착용 방역지침 준수 명령 업무 안내서(제9판) 원본 PDF
  ├── .nojekyll                    # GitHub Pages 정적 배포 시 Jekyll 빌드 에러 방지 파일
  └── supabase/
      └── functions/
          └── mask-ai/             # Supabase Edge Function (서버리스 임베딩 및 채팅 프록시)
```

---

## 🔒 보안 및 개인정보 처리 기준

1. **API Key 보호**: 사용자가 화면에 입력한 API Key는 브라우저 메모리 및 로컬 스토리지(`localStorage`)에만 안전하게 보관되며, 외부 서버나 데이터베이스로 전송·저장되지 않습니다.
2. **공공 데이터 안전성**: 본 시스템은 질병관리청에서 대중에 공식 배포한 공공 안내서(제9판)만을 참조하며, 민감한 개인정보나 비공개 내부 문서는 포함하지 않습니다.
3. **Read-Only 접근**: 클라이언트에서는 Supabase Publishable Key를 통한 읽기 전용(Read-only) 정책만 허용되어 데이터베이스 무결성이 유지됩니다.
