mod error_pages;
mod global_state;
mod templates;

use perseus::prelude::*;
use sycamore::prelude::*;

#[perseus::main(perseus_warp::dflt_server)]
pub fn main<G: Html>() -> PerseusApp<G> {
    PerseusApp::new()
        .template(templates::index::get_template())
        .index_view(|cx| {
            view! { cx,
                html {
                    head {
                        meta(charset = "UTF-8")
                        meta(name = "viewport", content = "width=device-width, initial-scale=1.0")
                        link(rel = "stylesheet", href = ".perseus/static/style.css")
                    }
                    body {
                        PerseusRoot()
                    }
                }
            }
        })
        .error_views(error_pages::get_error_pages())
        .global_state_creator(global_state::get_global_state_creator())
}
