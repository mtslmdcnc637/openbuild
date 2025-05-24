
import type { EditorElement, PageSettings } from '@/types/editor';
import { convertToInlineStyle } from './style-utils';
// Importei a função de download de HTML do novo arquivo de utilitários
// mas ela não será usada aqui, apenas a exportação de `downloadHtmlFile` de `download-utils.ts` será usada no EditorLayout.

function generateElementHtml(element: EditorElement): string {
  const Tag = element.type;
  // Para exportação, usamos principalmente os estilos desktop por enquanto
  // A implementação completa de media queries seria um passo futuro.
  const styleString = convertToInlineStyle(element.styles.desktop);

  let attributesString = '';
  if (element.attributes) {
    attributesString = Object.entries(element.attributes)
      .filter(([, value]) => value !== undefined && value !== null && value !== "" && typeof value !== 'object') 
      .map(([key, value]) => `${key}="${String(value).replace(/"/g, '&quot;')}"`) 
      .join(' ');
  }

  const childrenHtml = element.children.map(generateElementHtml).join('');

  let content = element.content || '';
  if (Tag === 'img' || Tag === 'hr' || (Tag === 'input' && element.attributes?.type !== 'submit' && element.attributes?.type !== 'button')) {
    return `<${Tag} style="${styleString}" ${attributesString} />`;
  }

  if (Tag === 'input' && element.attributes?.value) {
    content = '';
  }
  if (Tag === 'textarea') {
     return `<${Tag} style="${styleString}" ${attributesString}>${element.content || ''}</${Tag}>`;
  }

  return `<${Tag} style="${styleString}" ${attributesString}>${content}${childrenHtml}</${Tag}>`;
}

export function generateHtmlDocument(elements: EditorElement[], pageSettings: PageSettings): string {
  const bodyContent = elements.map(generateElementHtml).join('\n    ');

  const bodyStyles: string[] = [];
  if (pageSettings.bodyBackgroundColor) {
    bodyStyles.push(`background-color: ${pageSettings.bodyBackgroundColor};`);
  }
  if (pageSettings.bodyBackgroundImageUrl) {
    bodyStyles.push(`background-image: url('${pageSettings.bodyBackgroundImageUrl}');`);
    bodyStyles.push(`background-size: cover;`); 
    bodyStyles.push(`background-position: center;`);
    bodyStyles.push(`background-repeat: no-repeat;`);
  }
  const bodyStyleString = bodyStyles.join(' ');

  let headScripts = '';
  if (pageSettings.googleTagManagerId) {
    headScripts += `
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${pageSettings.googleTagManagerId}');</script>
    <!-- End Google Tag Manager -->`;
  }
  if (pageSettings.facebookPixelId) {
    headScripts += `
    <!-- Facebook Pixel Code -->
    <script>
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pageSettings.facebookPixelId}');
    fbq('track', 'PageView');
    </script>
    <noscript><img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=${pageSettings.facebookPixelId}&ev=PageView&noscript=1"
    /></noscript>
    <!-- End Facebook Pixel Code -->`;
  }
  if (pageSettings.tiktokPixelId) {
    headScripts += `
    <!-- TikTok Pixel Code -->
    <script>
    !function (w, d, t) {
      w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
      ttq.load('${pageSettings.tiktokPixelId}');
      ttq.page();
    }(window, document, 'ttq');
    </script>
    <!-- End TikTok Pixel Code -->`;
  }

  let gtmNoScript = '';
  if (pageSettings.googleTagManagerId) {
    gtmNoScript = `
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${pageSettings.googleTagManagerId}"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->`;
  }


  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageSettings.pageTitle || 'Página Criada com PageForge OpenBuild'}</title>
    <style>
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
        --background: 220 13% 95%; 
        --foreground: 215 25% 27%; 
        background-color: hsl(var(--background)); 
        color: hsl(var(--foreground));
      }
    </style>
    ${headScripts}
</head>
<body style="${bodyStyleString}">
    ${gtmNoScript}
    ${bodyContent}
</body>
</html>`;
}
