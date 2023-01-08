use crate::global_state::AppStateRx;
use perseus::prelude::*;
use sycamore::prelude::*;
use sycamore::web::NoSsr;
use web_sys::Event;

#[cfg(client)]
use gloo_net::http::Request;
#[cfg(client)]
use std::rc::Rc;
#[cfg(client)]
use todel::models::Message;

pub fn index_page<G: Html>(cx: Scope) -> View<G> {
    let state = Reactor::<G>::from_cx(cx).get_global_state::<AppStateRx>(cx);
    let content = create_signal(cx, String::new());
    let entered_name = create_signal(cx, String::new());

    #[cfg(client)]
    {
        state.load_name();
        state.start_websocket();
    }

    view! { cx,
        NoSsr {(
            match *state.name.get() {
                Some(_) => view! { cx,
                    div(class = "message-channel") {
                        ul(id = "messages") {
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
                        form(
                            id = "message-input-form",
                            on:submit = move |e :Event| {
                                e.prevent_default();
                                #[cfg(client)]
                                spawn_local_scoped(cx, async {
                                    Request::post("https://eludris.tooty.xyz/messages")
                                        .json(&Message {
                                            author: state.get_name().unwrap(),
                                            content: Rc::try_unwrap(content.take()).unwrap(),
                                        })
                                        .unwrap()
                                        .send()
                                        .await
                                        .unwrap();
                                })
                            }
                        ) {
                            input(
                                id = "message-input",
                                placeholder = "Send a message to Eludris",
                                bind:value = content
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
