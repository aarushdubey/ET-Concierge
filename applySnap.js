const fs = require('fs');

let content = fs.readFileSync('c:\\ET-Concierge\\app\\page.js', 'utf8');

// 1. Top level div modification: Add h-screen and snap-y
const origDiv = '<div className="bg-surface font-body text-on-surface antialiased overflow-x-hidden">';
const newDiv = '<div className="bg-surface font-body text-on-surface antialiased overflow-x-hidden h-screen overflow-y-scroll snap-y snap-mandatory bg-smooth">';
if (content.includes(origDiv)) {
  content = content.replace(origDiv, newDiv);
}

// 2. Modify <main> to ensure it fills the space correctly 
// Actually, it's better to make each section snap-start.
content = content.replace(/<section className="(.*?)"(.*?)>/g, '<section className="$1 min-h-screen snap-start flex flex-col justify-center pb-20"$2>');

// Note: The template already has <section className="..."> tags. Let's make sure we catch them.
// Wait, the template has `<section class="bg-surface-container-low py-32">` converted to `className="..."`.
// Example: `<section className="max-w-screen-2xl mx-auto px-8 md:px-16 py-20 grid md:grid-cols-2 gap-16 items-center">` -> `$1 min-h-screen...`

// 3. For the marquee "Feature Marquee", it is currently a <section> as well:
// `<section className="bg-on-surface py-12 overflow-hidden">`
// Let's ensure it doesn't take the full screen if it's just a marquee. We can remove min-h-screen from the marquee if it has it.
content = content.replace(/className="bg-on-surface py-12 overflow-hidden min-h-screen snap-start flex flex-col justify-center pb-20"/g, 'className="bg-on-surface py-12 overflow-hidden snap-start"');

// 4. Update footer to snap
content = content.replace(/<footer className="(.*?)"(.*?)>/g, '<footer className="$1 snap-start min-h-[50vh] flex flex-col justify-center"$2>');

// 5. Hide the scrollbar for standard presentation look
const styleInjection = `
      <style dangerouslySetInnerHTML={{__html: \`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .overflow-y-scroll::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .overflow-y-scroll {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .bg-smooth { scroll-behavior: smooth; }
      \`}} />
`;
content = content.replace(/<style dangerouslySetInnerHTML=\{[\s\S]*?\} \/>/g, (match) => {
    return match + "\\n" + styleInjection;
});

fs.writeFileSync('c:\\ET-Concierge\\app\\page.js', content);
console.log("Successfully applied presentation snap-scroll styles!");
