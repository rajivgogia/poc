import os
from dotenv import load_dotenv
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

llm = ChatOllama(
    model=os.getenv("OLLAMA_MODEL", "glm-5.2:cloud"),
    base_url=os.getenv("OLLAMA_BASE_URL", "https://api.ollama.com"),
    client_kwargs={"headers": {"Authorization": f"Bearer {os.getenv('OLLAMA_API_KEY')}"}},
)
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant."),
    ("human", "{user_input}"),
])
chat_chain = prompt | llm | StrOutputParser()

def chat(user_input: str) -> str:
    response = chat_chain.invoke({"user_input": user_input})
    print(response)
    return response

if __name__ == "__main__":
    print("LangChain + OpenAI Chat (type 'quit' to exit)\n")
    while True:
        user_input = input("You: ").strip()
        if user_input.lower() in ("quit", "exit"):
            break
        if not user_input:
            continue
        print("Assistant: ", end="")
        chat(user_input)
