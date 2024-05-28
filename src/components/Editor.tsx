interface Props {
  blogContent: string;
  setBlogContent: React.Dispatch<React.SetStateAction<string>>;
}

import React from "react";
import { Editor } from "@tinymce/tinymce-react";

export default function App({ blogContent, setBlogContent }: Props) {
  return (
    <Editor
      onChange={(e: any) => setBlogContent(e.target.getContent())}
      apiKey="cpbx2l55ox4m3aakz5cpgdmho1rp0nj0ysll5zfas2a0p028"
      init={{
        plugins:
          "anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount",
        toolbar:
          "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat",
      }}
      initialValue="Write your blog here..."
    />
  );
}
