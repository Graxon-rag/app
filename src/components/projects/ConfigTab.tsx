import ConfigCard from "./ConfigCard";

interface ConfigTabProps {
  details: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

function ConfigTab({ details }: ConfigTabProps) {
  return (
    <div className="grid md:grid-cols-2 gap-4 items-start">
      <ConfigCard
        title="LLM Model"
        subtitle={details?.llm_model?.name}
        fields={[
          { label: "ID", value: details?.llm_model?.id, mono: true },
          { label: "Model", value: details?.llm_model?.model_id, mono: true },
          { label: "Provider", value: details?.llm_model?.provider },
          { label: "Description", value: details?.llm_model?.description },
        ]}
      />

      <ConfigCard
        title="Embedding Model"
        subtitle={details?.embedding_model?.name}
        fields={[
          { label: "ID", value: details?.embedding_model?.id, mono: true },
          { label: "Model", value: details?.embedding_model?.model_id, mono: true },
          { label: "Provider", value: details?.embedding_model?.provider },
          { label: "Dimension", value: details?.embedding_model?.dimension },
          { label: "Description", value: details?.embedding_model?.description },
        ]}
      />

      <ConfigCard
        title="Sparse Model"
        subtitle={details?.sparse_text_model?.name}
        fields={[
          { label: "ID", value: details?.sparse_text_model?.id, mono: true },
          { label: "Provider", value: details?.sparse_text_model?.provider },
          { label: "Description", value: details?.sparse_text_model?.description },
        ]}
      />

      <ConfigCard
        title="Reranker"
        subtitle={details?.reranker?.name}
        fields={[
          { label: "ID", value: details?.reranker?.id, mono: true },
          { label: "Provider", value: details?.reranker?.provider },
          { label: "Model", value: details?.reranker?.model_name, mono: true },
          { label: "Description", value: details?.reranker?.description },
        ]}
      />

      <ConfigCard
        title="LLM Credential"
        subtitle={details?.llm_model_credential?.name}
        fields={[
          { label: "Provider", value: details?.llm_model_credential?.provider },
          { label: "API Key", value: details?.llm_model_credential?.api_key, mono: true },
          { label: "Description", value: details?.llm_model_credential?.description },
        ]}
      />

      <ConfigCard
        title="Embedding Credential"
        subtitle={details?.embedding_model_credential?.name}
        fields={[
          { label: "Provider", value: details?.embedding_model_credential?.provider },
          {
            label: "API Key",
            value: details?.embedding_model_credential?.api_key,
            mono: true,
          },
          { label: "Description", value: details?.embedding_model_credential?.description },
        ]}
      />
    </div>
  );
}

export default ConfigTab;
