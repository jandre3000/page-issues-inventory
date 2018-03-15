const fs = require( 'fs' );
const Mwbot = require('mwbot');
const langmap = {
    en: {
        domain: 'en',
        category: 'Category:Article message templates'
    },
    es: {
        domain: 'es',
        category: 'Categoría:Wikipedia:Plantillas_de_contenido'
    },
    pl: {
        domain: 'pl',
        category: 'Kategoria:Szablony_problemów_umieszczane_w_artykułach'
    },
    it: {
        domain: 'it',
        category: 'Categoria:Template di avviso'
    },
    de: {
        domain: 'de',
        category: 'Kategorie:Vorlage:Wartungsbaustein'
    },
    pt: {
        domain: 'pt',
        category: 'Categoria:!Avisos_para_artigos_com_problemas'
    },
    ru: {
        domain: 'ru',
        category: 'Категория:Шаблоны:Предупреждения'
    },
    fr: {
        domain: 'fr',
        category: "Catégorie:Modèle de bandeau d'article"
    },
    zh: {
        domain: 'zh',
        category: 'Category:條目訊息模板'
    },
    ja: {
        domain: 'ja',
        category: 'Category:記事メッセージボックス'
    }
}
const currentLang = langmap.pt;

const bot = new Mwbot( {
    apiUrl:  `https://${currentLang.domain}.wikipedia.org/w/api.php`
})

let filteredTitles = '';

const filterMembers = function( response ) {
    const categorymembers = response.query.categorymembers;
    const filteredMembers = categorymembers.filter( ( val, i ) => {
        if ( val.title === 'Template:Ambox/testcases' ) {
            return false;
        }
        if ( val.title.match("sandbox") ) {
            return false;
        }
        return true;
    } )
    filteredTitles = filteredMembers;
    return filteredMembers;
}

const createWikitext = function( categoryMembers ) {

    const fullWikitextArray = categoryMembers.map( member => {
        return `
🦐
<span class="template-title">${member.title}</span>
{{${member.title}}}
`;
    } );

    const chunksize = 50;
    return fullWikitextArray.reduce((ar, it, i) => {
        const ix = Math.floor(i/chunksize);

        if(!ar[ix]) {
          ar[ix] = [];
        }

        ar[ix].push(it);

        return ar;
      }, [])
};

const parseWikitext = function( wikitextArray ) {
    const botPromises = [];
    let delay = 1000;
    wikitextArray.forEach( wikitextChunk => {

        delay += 2000;

        const promise = new Promise( (resolve, reject) => {
            setTimeout( () => {
                bot.request({
                    action: 'parse',
                    text: wikitextChunk.join( '\n' ),
                    contentmodel: 'wikitext',
                    disabletoc: true,
                    utf8: true,
                    format: 'json',
                    formatversion: 2
                })
                .then( data => {
                    console.log('resolving parse request')
                    return resolve( data )
                } )
            }, delay )
        } );
        botPromises.push( promise );
    } )

    return Promise.all(botPromises);
}

const cleanHTML = function( responses ) {
    const junk = new RegExp( /\[\[Category:.*\]\]/, 'gi' );
    const cleaned = responses.map( r => r.parse.text.replace( junk, '' ) ).join('\n')
    return cleaned;
}

const createHTMLtemplate = function( html ) {
    filteredTitles;
    const row = html.split('🦐');
    const rowTemplateData = row.map( ( r, i ) => {  return { html: r, title: r.match(/\<span class="template-title"\>.*\<\/span\>/) && r.match(/\<span class="template-title"\>.*\<\/span\>/)[0] } } );
    const rows = htmlTableRowsTemplate( rowTemplateData );
    const table = htmlTableTemplate( rows );
    return htmlPageTemplate( table );
}

const htmlTableRowsTemplate = function( rowData ) {
    const rows = rowData.reduce( ( htmlString, row ) => {
        return htmlString += `
            <tr>
                <td class="template-name-cell">
                    ${row.title}
                </td>
                <td class="template-full-cell">
                    ${row.html}
                </td>
                <td class="template-compact-cell">
                    ${row.html}
                </td>
            </tr>
        `
    }, `` )
    return rows;
}

const htmlTableTemplate = function( tableRows ) {
    return `
        <table class="template-table">
            <thead>
            <tr>
                <th class="template-name-cell">
                    Template name
                </th>
                <th class="template-full-cell">
                    Full version
                </th>
                <th class="template-compact-cell">
                    Compact version
                </th>
            </tr>
            <thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
}

const htmlPageTemplate = function( parsedText ) {
    return `
    <!DOCTYPE html>
    <html lang=${currentLang.domain}>
        <head>
            <meta charset="utf-8"/>
            <link rel="stylesheet" href="https://${currentLang.domain}.wikipedia.org/w/load.php?debug=false&amp;lang=en&amp;modules=ext.uls.interlanguage%7Cext.visualEditor.desktopArticleTarget.noscript%7Cext.wikimediaBadges%7Cmediawiki.legacy.commonPrint%2Cshared%7Cmediawiki.sectionAnchor%7Cmediawiki.skinning.interface%7Cskins.vector.styles&amp;only=styles&amp;skin=vector"/>
            <script async="" src="https://${currentLang.domain}.wikipedia.org/w/load.php?debug=false&amp;lang=en&amp;modules=startup&amp;only=scripts&amp;skin=vector"></script>
            <meta name="ResourceLoaderDynamicStyles" content=""/>
            <link rel="stylesheet" href="https://${currentLang.domain}.wikipedia.org/w/load.php?debug=false&amp;lang=en&amp;modules=ext.gadget.charinsert-styles&amp;only=styles&amp;skin=vector"/>
            <link rel="stylesheet" href="https://${currentLang.domain}.wikipedia.org/w/load.php?debug=false&amp;lang=en&amp;modules=site.styles&amp;only=styles&amp;skin=vector"/>
            <link rel="stylesheet" href="style.css"/>
        </head>
        <body>
            <h1 class="page-title"> Page Issues inventory (${currentLang.domain}) </h1>

            <p class="page-description"> This is a rendering of templates from the category page <br/> <a href="https://${currentLang.domain}.wikipedia.org/wiki/${currentLang.category}">${currentLang.category}</a></p>

            <p class="page-description" id="js-count"></p>

            <nav class="page-nav">
                <a href="en.index.html">en</a>
                <a href="es.index.html">es</a>
                <a href="pl.index.html">pl</a>
                <a href="it.index.html">it</a>
                <a href="de.index.html">de</a>
                <a href="pt.index.html">pt</a>
                <a href="ru.index.html">ru</a>
                <a href="fr.index.html">fr</a>
                <a href="zh.index.html">zh</a>
                <a href="ja.index.html">ja</a>
            </nav>
            ${parsedText}
            <script src="script.js"></script>
        </body>
    </html>
    `
}


bot.request( {
    action: 'query',
    list: 'categorymembers',
    cmtitle: currentLang.category,
    cmlimit: 500,
    cmtype:'page',
    cmnamespace: 10,
    utf8: true,
    format: 'json',
    formatversion: 2
} )
.then( filterMembers )
.then( createWikitext )
.then( parseWikitext )
.then( cleanHTML )
.then( createHTMLtemplate )
.then( html => {
    fs.writeFileSync( `dist/${currentLang.domain}.index.html`, html )
} )

