package com.habeeb.calorieai;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WidgetPlugin")
public class WidgetPlugin extends Plugin {

    @PluginMethod
    public void update(PluginCall call) {
        int calories = call.getInt("calories", 0);
        int goal = call.getInt("goal", 2000);

        Context context = getContext();
        SharedPreferences.Editor editor = context
            .getSharedPreferences(CalorieWidget.PREFS_NAME, Context.MODE_PRIVATE)
            .edit();
        editor.putInt(CalorieWidget.KEY_CALORIES, calories);
        editor.putInt(CalorieWidget.KEY_GOAL, goal);
        editor.apply();

        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName name = new ComponentName(context, CalorieWidget.class);
        int[] ids = manager.getAppWidgetIds(name);
        for (int id : ids) {
            CalorieWidget.updateAppWidget(context, manager, id);
        }

        call.resolve();
    }
}
