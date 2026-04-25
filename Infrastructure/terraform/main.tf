provider "digitalocean" {
  token = var.do_token
}

data "digitalocean_domain" "main" {
  name = var.domain
}

resource "digitalocean_record" "root" {
  domain = data.digitalocean_domain.main.name
  type   = "A"
  name   = "@"
  value  = var.k8s_lb_ip
  ttl    = var.ttl
}

resource "digitalocean_record" "www" {
  domain = data.digitalocean_domain.main.name
  type   = "A"
  name   = "www"
  value  = var.k8s_lb_ip
  ttl    = var.ttl
}
