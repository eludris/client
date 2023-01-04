use crate::global_state::AppStateRx;
use perseus::prelude::*;
use sycamore::prelude::*;

pub fn index_page<G: Html>(cx: Scope) -> View<G> {
    let state = Reactor::<G>::from_cx(cx).get_global_state::<AppStateRx>(cx);

    #[cfg(client)]
    {
        state.load_name();
        state.start_websocket()
    }

    view! { cx,
        ul(class = "messages") {
            Indexed(
                iterable = &state.messages,
                view = |cx, x| view! { cx,
                    div(class = "message") {
                        span(class = "author") { (format!("[{}]: ", x.author)) }
                        span(class = "content") { (x.content) }
                    }
                }
            )
        }
    }
}

pub fn get_template<G: Html>() -> Template<G> {
    Template::build("index").view(index_page).head(head).build()
}

#[engine_only_fn]
pub fn head(cx: Scope) -> View<SsrNode> {
    view! { cx,
        title { "Pengin" }
    }
}
