// DateオブジェクトをRoamの日付の形式に変換する
const roamfy = (d) => {
    const ord = (n) => n + (n > 0 ? ['th', 'st', 'nd', 'rd'][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10] : '');
    const year = d.getFullYear();
    const month = d.toLocaleString('en-us', { month: 'long' });
    const date = ord(d.getDate());
    return `${month} ${date}, ${year}`
   }

   const title = document.querySelector("#article-title").textContent;
   const topic = document.querySelector("h2[data-qa-selector=article_label_text]").textContent;
   const wordCount = document.querySelector("div span[data-qa-selector=word_count]").textContent;
   //const lexile = document.querySelector("div[data-qa-selector=lexile_dropdown_menu] div").textContent; Lexile取得の際にエラーが出るためコメントアウト
   const imageSrc = document.querySelector("article img").getAttribute("src");
   const publishedDateDOMRes = document.evaluate("//span[text()='Published:']", document, null, XPathResult.ANY_TYPE, null);
   const publishedDateDOM = publishedDateDOMRes.iterateNext();
   const publishedDate = new Date(publishedDateDOM.nextElementSibling.textContent);
   const published = roamfy(publishedDate);

   const articleTexts = document.querySelectorAll("div[data-qa-selector=article_text] p,div[data-qa-selector=article_text] h2");

   let source = location.href;

   try {
     source = document.querySelector("link[rel='canonical']").getAttribute("href") ;
   } catch (e) {
       console.log("canonical url is not found.");
   }

   const attributes = [
    "#Newsela\n- " , //表示方式をLogseqのフォーマットに変更("::"はLogseqでは使用しないため ":"に変更)
    //`Lexile:: ${lexile}`, Lexile取得の際にエラーが出るためコメントアウト
    `Topic: #[[${topic}]]\n- `,
    `Published: [[${published}]]\n- `,
    `Date to Read: \n- `,
    `Quizzes: /4 correct\n- `, //項目を追加
    `Words: ${wordCount}\n- `,
    `Source: ${source}\n- `,
    `![](${imageSrc})\n- `,
    //"{{word-count}}" エラーが出るためコメントアウト
   ];

   let res = attributes.join("\n");

   let inParagraph = false;

   const putIndent = (inParagraph) => {
    const indent = inParagraph ? 4 : 2;
    return " ".repeat(indent);
   }

   articleTexts.forEach((n) => {
    const isH2 = n.tagName === "H2"
    const hasImage = n.querySelector("img") !== null;

    if (isH2) {
        inParagraph = false;
    }

    let text = isH2 ? `**${n.textContent}**` : n.textContent;

    if (hasImage) {
      const imageSrc = n.querySelector("img").getAttribute("src");
      text = `![](${imageSrc})\n- ${text}`; //imageの後ろの文章を改行しblockを挿入した
    }

    res += `${putIndent(inParagraph)} ${text}\n- `; //改行してblockを挿入した

    if (isH2) {
        inParagraph = true;
    }
   });

   navigator.clipboard.writeText(res);