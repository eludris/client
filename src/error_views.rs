use perseus::prelude::*;
use sycamore::prelude::*;

pub fn get_error_views<G: Html>() -> ErrorViews<G> {
    ErrorViews::new(|cx, err, _, _| {
        (
            view! { cx,
            title { "Errow" }
                },
            view! { cx,
                h1 { "It seems that shit went down, welp." }
                p { (format!("Error {}", err)) }
            },
        )
    })
}
