DEVELOPER_ROLE = "Developer"


def is_developer(user):
    if not user or not user.is_authenticated:
        return False
    return user.user_roles.filter(role__name=DEVELOPER_ROLE).exists()


def hide_developers(qs, user):
    """Developer accounts are invisible to everyone except the developer."""
    if is_developer(user):
        return qs
    return qs.exclude(user_roles__role__name=DEVELOPER_ROLE)
