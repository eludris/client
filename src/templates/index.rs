use crate::global_state::AppStateRx;
use markdown::to_html;
use perseus::prelude::*;
use sycamore::prelude::*;
use sycamore::rt::JsCast;
use sycamore::web::NoSsr;
use web_sys::{Event, HtmlSpanElement, KeyboardEvent};

#[cfg(client)]
use gloo_net::http::Request;
#[cfg(client)]
use todel::models::Message;

pub fn index_page<G: Html>(cx: Scope) -> View<G> {
    let state = Reactor::<G>::from_cx(cx).get_global_state::<AppStateRx>(cx);
    let entered_name = create_signal(cx, String::new());
    let last_name = create_signal(cx, String::new());
    let input_ref = create_node_ref(cx);

    on_mount(cx, || {
        let input = input_ref
            .get::<HydrateNode>()
            .unchecked_into::<HtmlSpanElement>();
        input.focus().unwrap();
    });

    let on_submit = move |e: Event| {
        e.prevent_default();
        let input = input_ref
            .get::<HydrateNode>()
            .unchecked_into::<HtmlSpanElement>();
        #[cfg(client)]
        let content = input.inner_text();
        input.set_inner_text("");
        input.focus().unwrap();
        #[cfg(client)]
        spawn_local_scoped(cx, async move {
            Request::post("https://eludris.tooty.xyz/messages")
                .json(&Message {
                    author: state.get_name().unwrap(),
                    content,
                })
                .unwrap()
                .send()
                .await
                .unwrap();
        })
    };

    #[cfg(client)]
    {
        state.load_name();
        state.start_websocket();
    }

    let v = view! { cx,
        NoSsr {(
            match *state.name.get() {
                Some(_) => view! { cx,
                    div(class = "message-channel") {
                        ul(id = "messages") {
                            Indexed(
                                iterable = &state.messages,
                                view = move |cx, x| {
                                    let content = to_html(&x.content);
                                    let author = x.author.clone();
                                    view! { cx,
                                        div(class = "message") {
                                            ({
                                                let author = author.clone();
                                                let html = if *last_name.get() != x.author {
                                                    view! { cx,
                                                        span(class = "author") { (format!("[{}]: ", author)) }
                                                    }
                                                } else {
                                                    View::empty()
                                                };
                                                last_name.set_silent(x.author.clone());
                                                html
                                            })
                                            div(class = "content", dangerously_set_inner_html = &content)
                                        }
                                    }
                                }
                            )
                        }
                        form(
                            id = "message-input-form",
                            on:submit = on_submit
                        ) {
                            div(
                                ref = input_ref,
                                id = "message-input",
                                placeholder = "Send a message to Eludris",
                                autofocus = true,
                                autocomplete = "off",
                                spellcheck = true,
                                contenteditable = true,
                                role = "textbox",
                                on:keypress = move |e: Event| {
                                    let e = e.unchecked_into::<KeyboardEvent>();
                                    if  e.key() == "Enter" && !e.shift_key() {
                                        on_submit(e.into());
                                    }
                                }
                            )
                            button(id = "send-button") { "Send" }
                        }
                    }
                },
                None => view! { cx,
                    h3 { "Please log in to continue" }
                    form(
                        id = "login-form",
                        on:submit = move |e: Event| {
                                e.prevent_default();
                                #[cfg(client)]
                                state.set_name(&entered_name.get())
                        }
                        ) {
                        label(for = "name") { "Username" }
                        input(
                            id = "name",
                            placeholder = "Enter your username",
                            bind:value = entered_name) {}
                    }
                },
            }
        )}
    };
    v
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
