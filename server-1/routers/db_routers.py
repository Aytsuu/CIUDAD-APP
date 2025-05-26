class HealthDBRouter:
    def db_for_read(self, model, **hints):
        if model._meta.app_label == 'healthProfiling':
            return 'healthDB'
        return None

    def db_for_write(self, model, **hints):
        if model._meta.app_label == 'healthProfiling':
            return 'healthDB'
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        # Prevent Django from applying migrations on healthDB
        if app_label == 'healthProfiling':
            return db == 'healthDB'
        return None
