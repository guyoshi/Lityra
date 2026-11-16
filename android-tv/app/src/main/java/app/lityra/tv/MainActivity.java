package app.lityra.tv;

import android.app.Activity;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.content.Intent;

/** Casca fina: abre o Lityra publicado. Toda atualização do site chega sozinha. */
public class MainActivity extends Activity {
    // Endereço publicado do Lityra (GitHub Pages).
    static final String HOME = "https://guyoshi.github.io/Lityra/";

    private WebView web;
    private boolean showingError = false;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#faf6ef"));
        setContentView(web, new ViewGroup.LayoutParams(-1, -1));

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setUserAgentString(s.getUserAgentString() + " LityraTV");
        CookieManager.getInstance().setAcceptCookie(true);

        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                String h = u.getHost() == null ? "" : u.getHost();
                if (h.equals("guyoshi.github.io") || h.endsWith("firebaseapp.com")
                        || h.endsWith("googleapis.com") || h.endsWith("gstatic.com")) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception e) { }
                return true;
            }
            @Override
            public void onReceivedError(WebView v, WebResourceRequest r, WebResourceError e) {
                if (r.isForMainFrame()) {
                    showingError = true;
                    v.loadData("<body style='background:#faf6ef;font-family:sans-serif;text-align:center;padding-top:20vh;font-size:28px'>"
                            + "<h1>Lityra</h1><p>Sem conexão com a internet.</p><p>Pressione OK para tentar de novo.</p></body>",
                            "text/html; charset=utf-8", "utf-8");
                }
            }
            @Override
            public void onPageFinished(WebView v, String url) {
                if (!showingError) v.requestFocus();
            }
        });
        web.loadUrl(HOME);
    }

    @Override
    public boolean onKeyDown(int code, KeyEvent e) {
        switch (code) {
            case KeyEvent.KEYCODE_BACK:
                web.evaluateJavascript("(window.lityraTvBack?window.lityraTvBack():false)", v -> {
                    if ("true".equals(v)) return;
                    if (web.canGoBack() && !showingError) web.goBack(); else finish();
                });
                return true;
            case KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE:
            case KeyEvent.KEYCODE_MEDIA_PLAY:
            case KeyEvent.KEYCODE_MEDIA_PAUSE:
            case KeyEvent.KEYCODE_MEDIA_FAST_FORWARD:
            case KeyEvent.KEYCODE_MEDIA_REWIND:
            case KeyEvent.KEYCODE_MEDIA_NEXT:
            case KeyEvent.KEYCODE_MEDIA_PREVIOUS:
                web.evaluateJavascript("window.lityraTvMedia&&window.lityraTvMedia(" + code + ")", null);
                return true;
            case KeyEvent.KEYCODE_DPAD_CENTER:
            case KeyEvent.KEYCODE_ENTER:
                if (showingError) {
                    showingError = false;
                    web.loadUrl(HOME);
                    return true;
                }
                break;
        }
        return super.onKeyDown(code, e);
    }

    @Override
    protected void onResume() { super.onResume(); web.onResume(); }

    @Override
    protected void onPause() { super.onPause(); /* mantém o áudio tocando */ }

    @Override
    protected void onDestroy() { web.destroy(); super.onDestroy(); }
}
