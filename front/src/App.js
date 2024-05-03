import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [url, setUrl] = useState("");
  const [response, setResponse] = useState({});

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const result = await axios.post("http://localhost:4000/scrape", { url });
      setResponse(result.data.data);
    } catch (error) {
      console.error("Error:", error);
      setResponse("Failed to send URL");
    }
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL"
        />
        <button type="submit">Get</button>
      </form>

      {response.title ? (
        <div className="miBlog">
          <h4>{response.title}</h4>
          <p>
            <strong>Content: </strong>
            {response.content}
          </p>
          <p>
            <strong>Excerpt: </strong>
            {response.summary}
          </p>
          <strong>Slug: </strong>
          <a href={url}>http://miblog.com/post/{response.slug}</a>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default App;
