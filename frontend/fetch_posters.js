async function test() {
  const title = "The Dark Knight (film)";
  const res = await fetch(\`https://en.wikipedia.org/w/api.php?action=query&titles=\${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=600\`);
  const data = await res.json();
  const pages = data.query.pages;
  const pageId = Object.keys(pages)[0];
  if (pages[pageId].thumbnail) {
    console.log(pages[pageId].thumbnail.source);
  } else {
    console.log("Not found");
  }
}
test();
