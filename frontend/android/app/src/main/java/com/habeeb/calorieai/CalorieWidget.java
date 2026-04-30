package com.habeeb.calorieai;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

public class CalorieWidget extends AppWidgetProvider {

    static final String PREFS_NAME = "CalorieWidgetPrefs";
    static final String KEY_CALORIES = "calories";
    static final String KEY_GOAL = "goal";

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        int calories = prefs.getInt(KEY_CALORIES, 0);
        int goal = prefs.getInt(KEY_GOAL, 2000);

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_calories);

        views.setTextViewText(R.id.widget_calories, String.valueOf(calories));
        views.setTextViewText(R.id.widget_consumed, calories + " consumed");
        views.setTextViewText(R.id.widget_goal, "/ " + goal + " goal");

        int progress = goal > 0 ? Math.min((calories * 100) / goal, 100) : 0;
        views.setProgressBar(R.id.widget_progress, 100, progress, false);

        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            context, 0, intent, PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_calories, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }
}
